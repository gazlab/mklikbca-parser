const parser = require("./lib/parser");

module.exports = {
  getSaldo: async (username, password) => {
    try {
      let resp;
      if (await parser.login(username, password)) {
        resp = await parser.getSaldo();
      }

      await parser.logout();
      return resp;
    } catch (error) {
      console.error(`${error}`);
    }
  },
  getMutasiRekening: async (username, password) => {
    try {
      let resp;
      if (await parser.login(username, password)) {
        resp = await parser.getMutasiRekening();
      }

      await parser.logout();
      return resp;
    } catch (error) {
      console.error(`${error}`);
    }
  },
  getAll: async (username, password) => {
    try {
      let resp;
      if (await parser.login(username, password)) {
        resp = {
          balance: await parser.getSaldo(),
          settlement: await parser.getMutasiRekening(),
        };
      }

      await parser.logout()
      return resp;
    } catch (error) {
      console.error(`${error}`);
    }
  },
};
