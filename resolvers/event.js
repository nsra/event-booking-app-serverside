const Event = require('../models/event');
const User = require('../models/user');
const { transformEvent } = require('./transform');
const { UserInputError } = require('apollo-server-express');
const { combineResolvers } = require("graphql-resolvers");
const { isLoggedin } = require("../middlewares/isLogin");
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();


const eventResolver = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find().populate('creator');
        return events.map(event => transformEvent(event));
      } catch (error) {
        throw error;
      }
    }
  },

  Mutation: {
    createEvent: combineResolvers(isLoggedin, async (_, args, context) => {
      const ExistingEvent = await Event.findOne({ title: args.eventInput.title });
      if (ExistingEvent) {
        throw new UserInputError('يوجد لدينا حدث بنفس هذا العنوان، الرجاء اختيار عنوان آخر!!');
      }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: context.user._id,
      });

      let createdEvent;
      try {
        const result = await event.save();
        createdEvent = transformEvent(result);
        const creator = await User.findById(context.user._id);

        if (!creator) {
          throw new Error('صاحب هذا الحدث غير موجود');
        }
        creator.createdEvents.push(event);
        await creator.save();
        pubsub.publish('EVENT_ADDED', { eventAdded: createdEvent });
        return createdEvent;
      } catch (err) {
        throw err;
      }
    })
  },

  Subscription: {
    eventAdded: {
      subscribe: () => pubsub.asyncIterator(['EVENT_ADDED']),
    },
  },
};

module.exports = { eventResolver };
