import Content from '../models/Content.js';

// Get all content
export const getAllContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['order', 'ASC']]
    });
    res.json({ status: true, data: contents });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ status: false, error: 'Failed to fetch content' });
  }
};

// Get content by key
export const getContentByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const content = await Content.findOne({
      where: { key }
    });

    if (!content) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    res.json({ status: true, data: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ status: false, error: 'Failed to fetch content' });
  }
};

// Create or update content by key
export const createOrUpdateContent = async (req, res) => {
  try {
    const { key, title, description, status, order } = req.body;
    const liveurl = `content/content/`;

    const [content, created] = await Content.upsert({
      key,
      title: title || null,
      description,
      liveurl,
      status: status || 'active',
      order: order || 0,
    });

    if (created) {
      // Update the liveurl with the actual id after creation
      await Content.update({ liveurl: `content/content/${content.id}` }, { where: { id: content.id } });
      content.liveurl = `content/content/${content.id}`;
    }

    res.status(created ? 201 : 200).json({
      status: true,
      message: created ? 'Content created successfully' : 'Content updated successfully',
      data: content
    });
  } catch (error) {
    console.error('Error creating/updating content:', error);
    res.status(500).json({ status: false, error: 'Failed to save content' });
  }
};
export const viewContentHTML = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("<h2>Invalid ID</h2>");
    }

    const content = await Content.findOne({
      where: { id, status: "active" }
    });

    if (!content) {
      return res.status(404).send("<h2>Content not found</h2>");
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <title>${content.title || "Terms & Conditions"}</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    :root {
      --primary: #2563eb;
      --text: #1f2937;
      --muted: #6b7280;
      --bg: #f9fafb;
      --border: #e5e7eb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.8;
    }

    .wrapper {
      max-width: 900px;
      margin: 60px auto;
      padding: 0 20px;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    .header {
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
      padding-bottom: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
    }

    .header p {
      margin-top: 8px;
      color: var(--muted);
      font-size: 14px;
    }

    .content {
      font-size: 15px;
      color: #374151;
    }

    .content h2 {
      margin-top: 36px;
      font-size: 20px;
      color: var(--text);
    }

    .content p {
      margin: 14px 0;
    }

    .content ul {
      padding-left: 20px;
      margin: 16px 0;
    }

    .content li {
      margin-bottom: 10px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 13px;
      color: var(--muted);
      text-align: center;
    }

    @media (max-width: 600px) {
      .card {
        padding: 28px;
      }

      .header h1 {
        font-size: 26px;
      }
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>${content.title || "Terms & Conditions"}</h1>
        ${
          content.description
            ? `<p>${content.description}</p>`
            : `<p>Last updated: ${new Date().toLocaleDateString()}</p>`
        }
      </div>

      <div class="content">
        ${content.message}
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("<h2>Something went wrong</h2>");
  }
};



// Update content by key
export const updateContentByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { title, description, status, order } = req.body;

    const [updatedRowsCount] = await Content.update({
      title,
      description,
      status,
      order
    }, {
      where: { key }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    const updatedContent = await Content.findOne({ where: { key } });
    res.json({
      status: true,
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ status: false, error: 'Failed to update content' });
  }
};

// Delete content by key
export const deleteContentByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const deletedRowsCount = await Content.destroy({
      where: { key }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    res.json({ status: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ status: false, error: 'Failed to delete content' });
  }
};

// Get content by ID
export const getContentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ status: false, error: 'Invalid ID' });
    }
    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    res.json({ status: true, data: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ status: false, error: 'Failed to fetch content' });
  }
};

// Update content by ID
export const updateContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, title, message, description, status, order } = req.body;

    const [updatedRowsCount] = await Content.update({
      key,
      title,
      message,
      description,
      status,
      order
    }, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    const updatedContent = await Content.findByPk(id);
    res.json({
      status: true,
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ status: false, error: 'Failed to update content' });
  }
};

// Delete content by ID
export const deleteContentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ status: false, error: 'Invalid ID' });
    }
    const deletedRowsCount = await Content.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ status: false, error: 'Content not found' });
    }

    res.json({ status: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ status: false, error: 'Failed to delete content' });
  }
};
