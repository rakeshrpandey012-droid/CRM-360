const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Note', 'Email', 'Call', 'Meeting', 'Status Change', 'Conversion', 'Task Created'],
    default: 'Note'
  },
  description: {
    type: String,
    required: [true, 'Activity description is required']
  },
  relatedTo: {
    itemType: {
      type: String,
      enum: ['Customer', 'Lead']
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
