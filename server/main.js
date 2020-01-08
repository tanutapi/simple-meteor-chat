import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.publish('messages', function() {
  return Messages.find({}, {sort: { createdAt: 1 }});
});

Meteor.publish(null, function() {
  return Meteor.users.find({}, {
    fields: {
      username: 1,
      profile: 1,
    },
  });
});

Meteor.methods({
  'sendMessages'(msg) {
    check(msg, String);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    Messages.insert({
      from: this.userId,
      msg: msg,
      createdAt: new Date(),
    });
  },
});

try {
  Accounts.createUser({
    username: 'user1',
    password: 'password1',
    profile: {
      name: 'Apple',
      surname: 'Seed',
    },
  });
} catch (err) {}

try {
  Accounts.createUser({
    username: 'user2',
    password: 'password2',
    profile: {
      name: 'John',
      surname: 'Doe',
    },
  });
} catch (err) {}