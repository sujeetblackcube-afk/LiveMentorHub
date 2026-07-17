export const initOneSignal = async () => {
  if (!window.OneSignal) {
    window.OneSignal = [];
  }

  return new Promise((resolve) => {
    window.OneSignal.push(async function () {
      await window.OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true, // important for localhost
        notifyButton: {
          enable: false,
        },
      });

      resolve(true);
    });
  });
};

export const getWebPlayerId = async () => {
  return new Promise((resolve) => {
    window.OneSignal.push(async function () {
      try {
        // Ask notification permission
        const permission = await window.OneSignal.Notifications.requestPermission();

        if (permission !== "granted") {
          // console.log("Notification permission denied");
          return resolve(null);
        }

        // Get OneSignal Player ID (Subscription ID)
        const playerId = window.OneSignal.User.PushSubscription.id;

        // console.log("OneSignal Player ID:", playerId);
        resolve(playerId || null);
      } catch (error) {
        console.error("OneSignal Error:", error);
        resolve(null);
      }
    });
  });
};