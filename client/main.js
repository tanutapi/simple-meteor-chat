import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import { Messages, Assets } from '../imports/collections';

import 'bootstrap/dist/css/bootstrap.css';

import './main.html';

Template.login.helpers({

});

Template.login.events({
  'submit form'(event, template) {
    event.preventDefault();
    const username = template.$('#username').val();
    const password = template.$('#password').val();
    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        console.log(err);
        template.$('.txtError').text(err.reason || err.message).removeClass('d-none');
      }
    });
  },
});

Template.login.onCreated(function() {

});

function sendMessage(template) {
  const msg = template.$('.txtMessage').val();
  if (!msg || !msg.trim()) {
    return;
  }
  Meteor.call('sendMessage', msg, (err, res) => {
    template.$('.txtMessage').val('').trigger('focus');
  });
}

Template.chat.helpers({
  user(idUser) {
    return Meteor.users.findOne(idUser);
  },
  messages() {
    return Messages.find({}, {
      sort: {
        createdAt: 1,
      },
    });
  },
  isOwn(message) {
    return message.from === Meteor.userId();
  },
  initial(sender) {
    return sender && sender.username ? sender.username.charAt(0).toUpperCase() : '?';
  },
  formatTime(date) {
    return date ? moment(date).format('HH:mm') : '';
  },
});

Template.chat.events({
  'click .btnLogout'() {
    Meteor.logout();
  },
  'click .btnSend'(event, template) {
    sendMessage(template);
  },
  'keydown .txtMessage'(event, template) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage(template);
    }
  },
  'click .btnClearAll'() {
    if (confirm('Do you want to delete all chat message?')) {
      Meteor.call('clearAllMessages');
    }
  }
});

Template.chat.onCreated(function() {
  this.subscribe('messages');
});

Template.chat.onRendered(function() {
  this.autorun(() => {
    Messages.find().count();
    Tracker.afterFlush(() => {
      const el = this.find('.chat-messages');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  });
});

Template.asset.helpers({
  users() {
    return Meteor.users.find();
  },
  assets() {
    return Assets.find();
  },
});

Template.asset.events({
  'change select'(event, template) {
    template.rvAssetOf.set(event.currentTarget.value);
  }
});

Template.asset.onCreated(function() {
  this.rvAssetOf = new ReactiveVar();

  this.autorun(() => {
    this.subscribe('assets', this.rvAssetOf.get());
  });
});
