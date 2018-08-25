require('./app/lib/webext-polyfill')

browser.runtime.onInstalled.addListener(function (details) {
  const isReasonInstall = details.reason === 'install'
  const isReasonUpdate = details.reason === 'update'

  const notificationId = 'install_update_notification'
  if (isReasonInstall) {
    browser.notifications.create(notificationId, {
      type: 'basic',
      title: browser.i18n.getMessage('notificationInstallTitle'),
      message: browser.i18n.getMessage('notificationInstallMessage'),
      iconUrl: browser.extension.getURL('icons/icon128.png')
    } as any)
  } else if (isReasonUpdate) {
    browser.notifications.create(notificationId, {
      type: 'basic',
      title: browser.i18n.getMessage('notificationUpdateTitle'),
      message: browser.i18n.getMessage('notificationUpdateMessage'),
      iconUrl: browser.extension.getURL('icons/icon128.png')
    } as any)
  }

  browser.notifications.onClicked.addListener(function (notiId) {
    if (notiId === notificationId) {
      browser.tabs.create({
        url: browser.extension.getURL('index.html')
      })
    }
    browser.notifications.clear(notiId)
  })
})

// TODO: set an url that will be visited upon uninstall event
// browser.runtime.setUninstallURL()
