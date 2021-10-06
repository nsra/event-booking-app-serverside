const transformEvent = event => ({
  ...event._doc,
  date: event.date.toDateString()
});

const transformBooking = booking => ({
  ...booking._doc,
  createdAt: booking.createdAt.toDateString(),
  updatedAt: booking.updatedAt.toDateString()
});

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
