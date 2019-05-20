import {
  Menu
} from 'electron'
export const customControlMenu = (menuItems) => {
  return Menu.buildFromTemplate(menuItems)
}