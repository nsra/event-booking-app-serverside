const Event = require('../models/event');
const Booking = require('../models/booking');
const { transformBooking, transformEvent } = require('./transform');
const { UserInputError } = require('apollo-server-express');
const { isLoggedin } = require("../middlewares/isLogin");

const bookingResolver = {
  Query: {
    bookings: (isLoggedin, async (_, __, context) => {
      try {
        const bookings = await Booking.find({ user: context.user._id }).populate('event').populate('user');
        return bookings.map(booking => transformBooking(booking));
      } catch (err) {
        throw err;
      }
    })
  },

  Mutation: {
    bookEvent: (isLoggedin, async (_, args, context) => {
      const existingBooking = await Booking.find({ event: args.eventId }).find({ user: context.user });
      if (existingBooking.length > 0) {
        throw new UserInputError('قد حجزت هذا الحدث بالفعل مسبقًا!!');
      }
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: context.user._id,
        event: fetchedEvent
      });
      const result = await booking.save();
      return transformBooking(result);
    }),

    cancelBooking: (isLoggedin, async (_, args, context) => {
      try {
        const booking = await Booking.findById(args.bookingId).populate('event');
        const event = transformEvent(booking.event);
        await Booking.deleteOne({ _id: args.bookingId });
        return event;
      } catch (err) {
        throw err;
      }
    })
  }
};

module.exports = { bookingResolver };
