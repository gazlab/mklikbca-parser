"use strict";

const { default: axios } = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const qs = require("qs");
const helper = require("./helper");
const dayjs = require("dayjs");

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const baseUrl = "https://m.klikbca.com";
const userAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 Edg/99.0.4844.74"; // Iphone 12 Pro

const axiosConfig = {
  baseURL: baseUrl,
  headers: {
    "User-Agent": userAgent,
  },
  withCredentials: true,
};

const getIp = async () => {
  const ipify = await axios.get("https://api.ipify.org/?format=json");
  return ipify.data.ip;
};

module.exports = {
  login: async (username, password) => {
    try {
      const ip = await getIp();
      const payload = {
        "value(user_id)": username,
        "value(pswd)": password,
        "value(Submit)": "LOGIN",
        "value(actions)": "login",
        "value(user_ip)": ip,
        user_ip: ip,
        "value(mobile)": true,
        "value(browser_info)": userAgent,
        mobile: true,
      };
      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Referer: `${baseUrl}/login.jsp`,
          Origin: baseUrl,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      const login = await client.post(
        "/authentication.do",
        qs.stringify(payload),
        config
      );

      if (!login.data.includes("MENU UTAMA")) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`${error}`);
    }
  },

  logout: async () => {
    try {
      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Referer: `${baseUrl}/authentication.do`,
        },
      };

      const logout = await client.get(
        "/authentication.do?value(actions)=logout",
        config
      );

      if (!logout.data.includes("Silakan masukkan USER ID Anda")) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`${error}`);
    }
  },

  getSaldo: async (username, password) => {
    try {
      const payload = {};
      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Referer: `${baseUrl}/accountstmt.do?value(actions)=menu`,
          Origin: baseUrl,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      const getSaldo = await client.post(
        "/balanceinquiry.do",
        qs.stringify(payload),
        config
      );

      if (!getSaldo.data.includes("INFORMASI REKENING - INFORMASI SALDO")) {
        return false;
      }

      return {
        rekening: helper.stringBetween(
          getSaldo.data,
          "<td><font size='1' color='#0000a7'><b>",
          "</td>"
        ),
        saldo: helper.toNumber(
          helper.stringBetween(
            getSaldo.data,
            "<td align='right'><font size='1' color='#0000a7'><b>",
            "</td>"
          )
        ),
      };
    } catch (error) {
      console.error(`${error}`);
    }
  },

  getMutasiRekening: async () => {
    try {
      const dateNow = dayjs();
      const dateD = dateNow.format("DD");
      const dateM = dateNow.format("MM");
      const dateY = dateNow.format("YYYY");
      const payload = {
        "value(r1)": 1,
        "value(D1)": 0,
        "value(startDt)": dateD,
        "value(startMt)": dateM,
        "value(startYr)": dateY,
        "value(endDt)": dateD,
        "value(endMt)": dateM,
        "value(endYr)": dateY,
      };
      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Referer: `${baseUrl}/accountstmt.do?value(actions)=acct_stmt`,
          Origin: baseUrl,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      const settlement = await client.post(
        "/accountstmt.do?value(actions)=acctstmtview",
        qs.stringify(payload),
        config
      );

      let cleanStmt = [];
      if (settlement.data.includes("TIDAK ADA TRANSAKSI")) {
        return cleanStmt;
      }

      // console.log(settlement.data);

      let stmt = helper.stringBetween(
        settlement.data,
        "KETERANGAN",
        "<!--<tr>"
      );
      stmt = helper.tdValue(stmt);
      
      for (let i = 1; i <= stmt.length; i += 2) {
        const keteranganRaw = helper.removeHtml(
          stmt[i].split("<br>").join("\n")
        );
        let keterangan = keteranganRaw.substring(0, keteranganRaw.length - 2);
        const nominal = helper.toNumber(keterangan.split(/\r?\n/).pop());

        keterangan = keterangan.replace(/\r?\n?[^\r\n]*$/, "");
        const cab = keterangan.split(/\r?\n/).pop();
        keterangan = keterangan.replace(/\r?\n?[^\r\n]*$/, "");

        cleanStmt.push({
          tanggal: helper.removeHtml(stmt[i - 1].split("<br>").join("\n")),
          keterangan,
          cab,
          nominal,
          mutasi: keteranganRaw.slice(-2),
        });
      }

      return cleanStmt;
    } catch (error) {
      console.error(`${error}`);
    }
  },
};
