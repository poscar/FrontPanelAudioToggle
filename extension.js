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
    this.toggleMenuItem = new PopupMenu.PopupSwitchMenuItem('Front Panel Audio', false);
    this.toggleMenuItem.connect('toggled', this.toggleFrontPanelAudio);

    this.toggleMenuSeparator = new PopupMenu.PopupSeparatorMenuItem();

    menu.connect('open-state-changed', this.updateFrontPanelAudio);
    menu.addMenuItem(this.toggleMenuItem, atIndex);
    menu.addMenuItem(this.toggleMenuSeparator, atIndex + 1);
  },

  destroy: function() {
    this.toggleMenuItem.destroy();
    this.toggleMenuSeparator.destroy();
  },

  updateFrontPanelAudio: function (menu, open) {
    if (!open) {
      return;
    }

    let outArgs = GLib.spawn_command_line_sync('env LANG=C amixer sget \'Front Panel\'');
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
        Util.spawnCommandLine('amixer -q sset \'Front Panel\' unmute');
    } else {
        // DISABLED
        Util.spawnCommandLine('amixer -q sset \'Front Panel\' mute');
    }
  }
});

function init() {
  // TODO: Translations
}

function enable() {
  frontPanelAudioToggle = new FrontPanelAudioToggle(Main.panel.statusArea['volume'].menu, 2);
}

function disable() {
  frontPanelAudioToggle.destroy();
  frontPanelAudioToggle = null;
}