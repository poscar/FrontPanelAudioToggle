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

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;

let toggleMenuItem;

function _updateFrontPanelAudio(menu, open) {
  if (!open) {
    return;
  }

  let outArgs = GLib.spawn_command_line_sync('env LANG=C amixer sget \'Front Panel\'');
  let stdout = outArgs[1];

  let regex = /\[(on|off)\]/m;
  let matches = regex.exec(stdout);
  let value = matches[1];

  if (value === 'on') {
    toggleMenuItem.setToggleState(true);
  }
  else {
    toggleMenuItem.setToggleState(false);
  }
}

function _toggleFrontPanelAudio(item, event) {
  if (item.state) {
      // ENABLED
      Util.spawnCommandLine('amixer -q sset \'Front Panel\' unmute');
  } else {
      // DISABLED
      Util.spawnCommandLine('amixer -q sset \'Front Panel\' mute');
  }
}

function init() {
}

function enable() {
    toggleMenuItem = new PopupMenu.PopupSwitchMenuItem('Front Panel Audio', false);
    toggleMenuItem.connect('toggled', _toggleFrontPanelAudio);
    toggleMenuSeparator = new PopupMenu.PopupSeparatorMenuItem();
    Main.panel.statusArea['volume'].menu.connect('open-state-changed', _updateFrontPanelAudio);
    Main.panel.statusArea['volume'].menu.addMenuItem(toggleMenuItem, 2);
    Main.panel.statusArea['volume'].menu.addMenuItem(toggleMenuSeparator, 3);
}

function disable() {
    toggleMenuItem.destroy();
    toggleMenuSeparator.destroy();
}