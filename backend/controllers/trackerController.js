const User = require('../models/User');

const normalizeApplication = (item) => ({
  _id: item._id,
  title: item.title,
  organization: item.organization,
  category: item.category || 'Government Exam',
  status: item.status || 'Interested',
  deadline: item.deadline || null,
  officialLink: item.officialLink || '',
  notes: item.notes || '',
  createdAt: item.createdAt,
  updatedAt: item.updatedAt || item.createdAt,
});

const getTracker = async (req, res) => {
  const user = await User.findById(req.user._id).select('applications');
  res.json({
    applications: (user?.applications || [])
      .map(normalizeApplication)
      .sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const db = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      }),
    comingSoon: [
      'Auto vacancy feed',
      'AI study assistant',
      'Qualification-based matching',
    ],
  });
};

const createApplication = async (req, res) => {
  const { title, organization, category, status, deadline, officialLink, notes } = req.body;

  if (!title?.trim() || !organization?.trim()) {
    return res.status(400).json({ message: 'Title and organization are required.' });
  }

  const user = await User.findById(req.user._id);
  user.applications.push({
    title: title.trim(),
    organization: organization.trim(),
    category: category?.trim() || 'Government Exam',
    status: status?.trim() || 'Interested',
    deadline: deadline || null,
    officialLink: officialLink?.trim() || '',
    notes: notes?.trim() || '',
    updatedAt: new Date(),
  });
  await user.save();

  const created = user.applications[user.applications.length - 1];
  res.status(201).json({ application: normalizeApplication(created) });
};

const updateApplication = async (req, res) => {
  const { itemId } = req.params;
  const user = await User.findById(req.user._id);
  const item = user.applications.id(itemId);

  if (!item) {
    return res.status(404).json({ message: 'Application not found.' });
  }

  const { title, organization, category, status, deadline, officialLink, notes } = req.body;

  if (title !== undefined) item.title = title.trim();
  if (organization !== undefined) item.organization = organization.trim();
  if (category !== undefined) item.category = category.trim() || 'Government Exam';
  if (status !== undefined) item.status = status.trim() || 'Interested';
  if (deadline !== undefined) item.deadline = deadline || null;
  if (officialLink !== undefined) item.officialLink = officialLink.trim();
  if (notes !== undefined) item.notes = notes.trim();
  item.updatedAt = new Date();

  await user.save();
  res.json({ application: normalizeApplication(item) });
};

const deleteApplication = async (req, res) => {
  const { itemId } = req.params;
  const user = await User.findById(req.user._id);
  const item = user.applications.id(itemId);

  if (!item) {
    return res.status(404).json({ message: 'Application not found.' });
  }

  item.deleteOne();
  await user.save();

  res.json({ message: 'Application removed.' });
};

module.exports = {
  getTracker,
  createApplication,
  updateApplication,
  deleteApplication,
};
