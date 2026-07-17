import ContactUs from '../models/ContactUs.js';
import Notification from '../models/Notifications.js';
import SuperAdmin from '../models/SuperAdmin.js';
import { triggerPushForNotifications } from '../config/onesignalService.js';

// Get all contact messages
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Failed to fetch contact messages' });
  }
};

// Get contact message by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ContactUs.findByPk(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Failed to fetch contact message' });
  }
};

// Create new contact message (public route)
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, role, specificId } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Name, email, subject, and message are required'
      });
    }

    // Validate role if provided
    if (role && !['student', 'teacher', 'parent'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be student, teacher, or parent'
      });
    }

    const contact = await ContactUs.create({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      role: role || null,
      specificId: specificId || null
    });

    // Send notification to superadmin
    try {
      // Get all superadmins
      const superadmins = await SuperAdmin.findAll({
        where: { role: 'superadmin' }
      });

      if (superadmins.length > 0) {
        const notifications = superadmins.map((superadmin) => ({
          specificId: superadmin.userId.toString(),
          role: 'superadmin',
          title: '📬 New Contact Message',
          message: `${name} (${email}) sent a message: ${subject}`,
          type: 'contact',
          referenceId: contact.id
        }));

        // Create notifications in DB
        const createdNotifications = await Notification.bulkCreate(notifications, { returning: true });

        // Send push notifications
        await triggerPushForNotifications(createdNotifications);
      }
    } catch (notificationError) {
      console.error('Error sending notification to superadmin:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Invalid email format or data'
      });
    }
    res.status(500).json({ message: 'Failed to send contact message' });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REPLIED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be PENDING, REPLIED, or CLOSED'
      });
    }

    const [updatedRowsCount] = await ContactUs.update(
      { status },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    const updatedContact = await ContactUs.findByPk(id);
    res.json({
      message: 'Contact status updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ message: 'Failed to update contact status' });
  }
};

// Send reply to contact message
export const sendReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        message: 'Reply message is required'
      });
    }

    // Get the contact message first to find who sent it
    const contact = await ContactUs.findByPk(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Update status to REPLIED
    const [updatedRowsCount] = await ContactUs.update(
      { status: 'REPLIED' },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Send notification to the specific user who sent the original message
    if (contact.role && contact.specificId) {
      try {
        const notification = await Notification.create({
          specificId: contact.specificId.toString(),
          role: contact.role,
          title: '📩 Reply to Your Contact Message',
          message: `Admin replied: ${replyMessage}`,
          type: 'contact_reply',
          referenceId: contact.id
        });

        // Send push notification to the specific user
        await triggerPushForNotifications([notification]);
      } catch (notificationError) {
        console.error('Error sending notification to user:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    const updatedContact = await ContactUs.findByPk(id);
    res.json({
      message: 'Reply sent successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

// Delete contact message
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await ContactUs.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Failed to delete contact message' });
  }
};
