/*  
    Copyright (C) 2013  Oscar Perez

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;

let frontPanelAudioToggle;

const FrontPanelAudioToggle = new Lang.Class({
  Name: 'FrontPanelAudioToggle',

  _init: function (menu, atIndex) {
    this.card = this.findFrontPanelCard();

    this.toggleMenuSeparator = new PopupMenu.PopupSeparatorMenuItem();

    if (this.card !== -1) {
      this.toggleMenuItem = new PopupMenu.PopupSwitchMenuItem('Front Panel Audio', false);
      this.toggleMenuItem.connect('toggled', Lang.bind(this, this.toggleFrontPanelAudio));
      menu.connect('open-state-changed', Lang.bind(this, this.updateFrontPanelAudio));
    }
    else {
      this.toggleMenuItem = new PopupMenu.PopupMenuItem('Front Panel Audio Not Found');
    }

    menu.addMenuItem(this.toggleMenuSeparator, atIndex);
    menu.addMenuItem(this.toggleMenuItem, atIndex + 1);
  },

  destroy: function() {
    this.toggleMenuItem.destroy();
    this.toggleMenuSeparator.destroy();
  },

  findFrontPanelCard: function () {
    let deviceList = GLib.spawn_command_line_sync("env LANG=C aplay -l")[1].toString();
    let deviceLines = deviceList.split('\n');
    let maxCard = 0;

    for (var lineIdx in deviceLines) {
      var line = deviceLines[lineIdx];
      var cardMatch = /card\s*(\d+):/.exec(line);
      if (cardMatch && cardMatch[1]) {
        maxCard = Math.max(maxCard, cardMatch[1]);
      }
    }

    for (let card = 0; card <= maxCard; card++) {
        let cardControls = GLib.spawn_command_line_sync("env LANG=C amixer -c " + card + " scontrols")[1].toString();
        let hasFrontPanel = /Front Panel/.test(cardControls);
        if (hasFrontPanel) {
            return card;
        }
    }

    return -1;
  },

  updateFrontPanelAudio: function (menu, open) {
    if (!open) {
      return;
    }

    let outArgs = GLib.spawn_command_line_sync('env LANG=C amixer -c ' + this.card + ' sget \'Front Panel\'');
    let stdout = outArgs[1];

    let regex = /\[(on|off)\]/m;
    let matches = regex.exec(stdout);
    let value = matches[1];

    if (value === 'on') {
      this.toggleMenuItem.setToggleState(true);
    }
    else {
      this.toggleMenuItem.setToggleState(false);
    }
  },

  toggleFrontPanelAudio: function (item, event) {
    if (item.state) {
        // ENABLED
        Util.spawnCommandLine('amixer -c ' + this.card + ' -q sset \'Front Panel\' unmute');
    } else {
        // DISABLED
        Util.spawnCommandLine('amixer -c ' + this.card + ' -q sset \'Front Panel\' mute');
    }
  }
});

function init() {
}

function enable() {
  frontPanelAudioToggle = new FrontPanelAudioToggle(Main.panel.statusArea['volume'].menu, 1);
}

function disable() {
  frontPanelAudioToggle.destroy();
  frontPanelAudioToggle = null;
}