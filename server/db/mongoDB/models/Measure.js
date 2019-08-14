const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MeasureSchema = new Schema({
  time: { type: Date, default: new Date() },
  device: {
    type: Schema.Types.ObjectId,
    ref: 'devices'
  },
  processed: {
    type: Boolean,
    default: false
  },
  temperature: {
    sensor: {
      type: Schema.Types.ObjectId,
      ref: 'sensors'
    },
    value: {
      type: Number
    }
  },
  humidity: {
    sensor: {
      type: Schema.Types.ObjectId,
      ref: 'sensors'
    },
    value: {
      type: Number
    }
  },
  moisture: {
    sensor: {
      type: Schema.Types.ObjectId,
      ref: 'sensors'
    },
    value: {
      type: Number
    }
  },
  lightIntensity: {
    sensor: {
      type: Schema.Types.ObjectId,
      ref: 'sensors'
    },
    value: {
      type: Number
    }
  }
})

mongoose.model('measures', MeasureSchema)
