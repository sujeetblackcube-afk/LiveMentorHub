import express from "express";

const router = express.Router();

router.get("/delete-account", ( req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Delete Account & Support</title>
            <style>
                body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    background-color: #f8fafc; 
                    margin: 0; 
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                .main-content {
                    flex: 1;
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    padding: 2rem 1rem;
                }
                .card { 
                    background: #ffffff; 
                    padding: 2.5rem; 
                    border-radius: 1rem; 
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); 
                    width: 100%; 
                    max-width: 420px; 
                    box-sizing: border-box;
                }
                h2 { color: #0d1f5c; margin-top: 0; font-size: 1.5rem; }
                p { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
                .form-group { margin-bottom: 1rem; text-align: left; }
                label { display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
                input { 
                    width: 100%; 
                    padding: 0.75rem; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 0.5rem; 
                    box-sizing: border-box; 
                    font-size: 0.875rem;
                    outline: none;
                }
                input:focus { border-color: #ef4444; }
                button.delete-btn { 
                    background: #ef4444; 
                    color: white; 
                    border: none; 
                    padding: 0.75rem; 
                    width: 100%; 
                    border-radius: 0.5rem; 
                    cursor: pointer; 
                    font-weight: 600; 
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }
                button.delete-btn:hover { background: #dc2626; }

                /* Footer styles */
                footer {
                    background-color: #0d1f5c;
                    color: white;
                    padding: 2.5rem 1rem;
                    border-top-left-radius: 2rem;
                    border-top-right-radius: 2rem;
                }
                .footer-container {
                    max-width: 900px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media(min-width: 640px) {
                    .footer-container {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                footer h4 {
                    color: #d4940a;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 0;
                    margin-bottom: 1rem;
                }
                footer ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 0.875rem;
                    color: #cbd5e1;
                }
                footer li {
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                footer a {
                    color: #cbd5e1;
                    text-decoration: none;
                }
                footer a:hover {
                    color: white;
                }
                .static-btn {
                    background-color: #d4940a;
                    color: white;
                    border: none;
                    padding: 0.65rem 1rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    width: 100%;
                    cursor: default;
                    text-align: center;
                    box-sizing: border-box;
                    margin-top: 1rem;
                    user-select: none;
                }
                .footer-bottom {
                    text-align: center;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 2.5rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 1rem;
                    max-width: 900px;
                    margin-left: auto;
                    margin-right: auto;
                }
            </style>
        </head>
        <body>
            <div class="main-content">
                <div class="card">
                    <h2>Delete Student Account</h2>
                    <p>This action is permanent and will remove student records from the database.</p>
                    <form action="/delete-account" method="POST">
                        <div class="form-group">
                            <label for="identifier">Student Email or ID</label>
                            <input type="text" id="identifier" name="identifier" placeholder="e.g. student@example.com" required />
                        </div>
                        <button type="submit" class="delete-btn">Confirm & Delete</button>
                    </form>
                </div>
            </div>

            <footer>
                <div class="footer-container">
                    <div>
                        <h3 style="color: white; margin-top: 0; font-size: 1.1rem;">LiveMentorHub</h3>
                        <p style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.5;">
                            Empowering learners with top-notch mentorship, courses, and resources to build exceptional careers.
                        </p>
                    </div>
                    <div>
                        <h4>Get in Touch</h4>
                        <ul>
                            <li><span>📍</span> Nehru Place, New Delhi - 110019</li>
                            <li><span>📞</span> <a href="tel:+919217751344">+91 9217751344</a></li>
                            <li><span>✉️</span> <a href="mailto:support@livementorhub.com">support@livementorhub.com</a></li>
                        </ul>
                        <!-- Static Show-Only Button (Does nothing) -->
                        <button type="button" class="static-btn" onclick="return false;">Support Available</button>
                    </div>
                </div>
                <div class="footer-bottom">
                    &copy; 2026 LiveMentorHub. All rights reserved.
                </div>
            </footer>
        </body>
        </html>
    `);
});

export default router;
