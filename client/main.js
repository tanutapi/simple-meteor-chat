import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import { Messages, Assets, Status } from '../imports/collections';

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

function purgeSecondsLeft(template) {
  const status = Status.findOne('chatPurge');
  if (!status || !status.nextPurgeAt) {
    return null;
  }
  const now = template.rvNow.get();
  return Math.max(0, Math.ceil((status.nextPurgeAt.getTime() - now) / 1000));
}

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
  purgeCountdown() {
    const seconds = purgeSecondsLeft(Template.instance());
    if (seconds === null) {
      return '-:--';
    }
    const mm = Math.floor(seconds / 60);
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },
  purgeUrgent() {
    const seconds = purgeSecondsLeft(Template.instance());
    return seconds !== null && seconds <= 10;
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
  this.subscribe('status');
  this.rvNow = new ReactiveVar(Date.now());
  this.hClock = Meteor.setInterval(() => {
    this.rvNow.set(Date.now());
  }, 1000);
});

Template.chat.onDestroyed(function() {
  Meteor.clearInterval(this.hClock);
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
