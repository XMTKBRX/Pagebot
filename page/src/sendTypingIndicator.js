const axios = require("axios");

module.exports = function (event) {
  return function sendTypingIndicator(isTyping, userId) {
    const senderAction = isTyping ? "typing_on" : "typing_off";
    const form = {
      recipient: {
        id: userId || event.sender.id,
      },
      sender_action: senderAction,
    };

    // Return the promise directly
    return Graph(form)
      .then((response) => response)
      .catch((err) => {
        throw err;
      });
  };

  function Graph(form) {
    return axios
      .post(
        `https://graph.facebook.com/v20.0/me/messages?access_token=${EAAUYi3QZAJpgBO0ZCeA87HAJIT803HQL4Ed2q5Fep0VKRHjepwfUe0hwwLYYOGdE5f7laMqIEJhH0ynSdIJu6PJUpsxZCzw9iXPfy6uHmAFiZAA7NquD181PhYrP1H3ym5gqMwSlFM4owD99R9g4ZCEtiyLdNvBZC2DsgLigVmChkrR0tFAvNNuHs5k1VqugZDZD}`,
        form
      )
      .then((res) => res.data)
      .catch((err) => {
        throw err.response ? err.response.data : err.message;
      });
  }
};

// If an error occurs please contact @YanMaglinte
// FB: https://www.facebook.com/yandeva.me
