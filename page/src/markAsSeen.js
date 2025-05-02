const axios = require("axios");

module.exports = function (event) {
  return function markAsSeen(boolean, senderId) {
    // Prepare the form based on the boolean value
    const form = {
      recipient: {
        id: senderId || event.sender.id,
      },
      sender_action: boolean ? "mark_seen" : "mark_unread",
    };

    // Return the axios promise directly
    return axios
      .post(
        `https://graph.facebook.com/v20.0/me/messages?access_token=${EAAUYi3QZAJpgBO0ZCeA87HAJIT803HQL4Ed2q5Fep0VKRHjepwfUe0hwwLYYOGdE5f7laMqIEJhH0ynSdIJu6PJUpsxZCzw9iXPfy6uHmAFiZAA7NquD181PhYrP1H3ym5gqMwSlFM4owD99R9g4ZCEtiyLdNvBZC2DsgLigVmChkrR0tFAvNNuHs5k1VqugZDZD}`,
        form
      )
      .then((res) => res.data) // Return the response data
      .catch((err) => {
        // Handle errors and throw them
        throw err.response ? err.response.data : err.message;
      });
  };
};

// If an error occurs please contact @YanMaglinte
// FB: https://www.facebook.com/yandeva.me
