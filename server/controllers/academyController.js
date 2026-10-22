import Academy from '../models/Academy.js';

// @desc    Get academy details
// @route   GET /api/academy
// @access  Private
export const getAcademy = async (req, res) => {
  let academy = await Academy.findOne();
  if (!academy) {
    academy = await Academy.create({
      name: 'TalentScout Elite Football Academy',
      motto: 'Developing the Football Stars of Tomorrow',
      address: '100 Stadium Way, Football City',
      email: 'contact@talentscout.fc',
      phone: '+1 (555) 019-2834',
      foundedYear: 2018,
    });
  }
  res.json(academy);
};

// @desc    Update academy details (Manager only)
// @route   PUT /api/academy
// @access  Private (Manager only)
export const updateAcademy = async (req, res) => {
  let academy = await Academy.findOne();
  if (!academy) {
    academy = new Academy();
  }

  const fields = ['name', 'motto', 'address', 'email', 'phone', 'foundedYear', 'philosophy', 'logo'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      academy[field] = req.body[field];
    }
  });

  const updated = await academy.save();
  res.json(updated);
};
