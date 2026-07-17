import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Parent from "../models/Parent.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import pkg from "sequelize";
const { Op } = pkg;

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Start of Week
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Re-instantiate `now` so it's not mutated by setDate above
    const currentNow = new Date();

    const [
      studentCount,
      approvedStudentCount,
      teacherCount,
      parentCount,
      courseCount,
      totalEnrollmentCount,
      approvedEnrollmentCount,
      passoutEnrollmentCount,
      enrollmentCountThisMonth,
      enrollmentCountThisWeek
    ] = await Promise.all([
      Student.count(),
      Student.count({ where: { status: 'APPROVED' } }),
      Teacher.count(),
      Parent.count(),
      Course.count(),
      Enrollment.count(),
      Enrollment.count({ where: { status: 'APPROVED' } }),
      Enrollment.count({ where: { status: 'PASSOUT' } }),
      Enrollment.count({ where: { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } } }),
      Enrollment.count({ where: { createdAt: { [Op.between]: [startOfWeek, endOfWeek] } } }),
    ]);

    // Enrollment Data This Week
    const enrollmentDataThisWeekPromises = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayName = dayStart.toLocaleDateString("en-US", { weekday: "short" });
      
      enrollmentDataThisWeekPromises.push(
        Enrollment.count({ where: { createdAt: { [Op.between]: [dayStart, dayEnd] } } })
          .then(count => ({ day: dayName, students: count }))
      );
    }

    // Enrollment Data This Month
    const enrollmentDataThisMonthPromises = [];
    const daysInMonth = endOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStart = new Date(currentNow.getFullYear(), currentNow.getMonth(), i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentNow.getFullYear(), currentNow.getMonth(), i);
      dayEnd.setHours(23, 59, 59, 999);
      
      enrollmentDataThisMonthPromises.push(
        Enrollment.count({ where: { createdAt: { [Op.between]: [dayStart, dayEnd] } } })
          .then(count => ({ day: i.toString(), students: count }))
      );
    }

    // Sales Data This Week
    const salesDataThisWeekPromises = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayName = dayStart.toLocaleDateString("en-US", { weekday: "short" });
      
      salesDataThisWeekPromises.push(
        Enrollment.sum('amountPaid', { 
          where: { 
            createdAt: { [Op.between]: [dayStart, dayEnd] },
            paymentStatus: "PAID"
          } 
        }).then(sum => ({ day: dayName, sales: sum || 0 }))
      );
    }

    // Sales Data This Month
    const salesDataThisMonthPromises = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStart = new Date(currentNow.getFullYear(), currentNow.getMonth(), i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentNow.getFullYear(), currentNow.getMonth(), i);
      dayEnd.setHours(23, 59, 59, 999);
      
      salesDataThisMonthPromises.push(
        Enrollment.sum('amountPaid', { 
          where: { 
            createdAt: { [Op.between]: [dayStart, dayEnd] },
            paymentStatus: "PAID"
          } 
        }).then(sum => ({ day: i.toString(), sales: sum || 0 }))
      );
    }

    const [
      enrollmentDataThisWeek,
      enrollmentDataThisMonth,
      salesDataThisWeek,
      salesDataThisMonth,
      totalSalesThisMonth,
      totalSalesThisWeek
    ] = await Promise.all([
      Promise.all(enrollmentDataThisWeekPromises),
      Promise.all(enrollmentDataThisMonthPromises),
      Promise.all(salesDataThisWeekPromises),
      Promise.all(salesDataThisMonthPromises),
      Enrollment.sum('amountPaid', { 
        where: { 
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
          paymentStatus: "PAID"
        } 
      }),
      Enrollment.sum('amountPaid', { 
        where: { 
          createdAt: { [Op.between]: [startOfWeek, endOfWeek] },
          paymentStatus: "PAID"
        } 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          student: studentCount,
          approvedStudent: approvedStudentCount,
          teacher: teacherCount,
          parent: parentCount,
          course: courseCount,
          enrollment: {
            total: totalEnrollmentCount,
            approved: approvedEnrollmentCount,
            passout: passoutEnrollmentCount,
            month: enrollmentCountThisMonth,
            week: enrollmentCountThisWeek
          },
          sales: {
            month: totalSalesThisMonth || 0,
            week: totalSalesThisWeek || 0
          }
        },
        charts: {
          enrollmentThisWeek: enrollmentDataThisWeek,
          enrollmentThisMonth: enrollmentDataThisMonth,
          salesThisWeek: salesDataThisWeek,
          salesThisMonth: salesDataThisMonth
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
      error: error.message
    });
  }
};
