const https = require("https");
const crypto = require("crypto");

const momopayment = async (am, pc, desU, des, acc, scr) => {
    // const accessKey = "F8BBA842ECF85";
    // const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const accessKey = acc;
    const secretKey = scr;
    const orderInfo =  des;
    const partnerCode = pc;
    const redirectUrl = desU;
    const ipnUrl = "https://callback.url/notify";
    const requestType = "captureWallet";
    const amount = Math.round(am);
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = "";
    // const paymentCode = "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";

    var rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId+"&requestType=" + requestType
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
    });

    const options = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                console.log("No more data in response.");
                try {
                    const obj = JSON.parse(data);
                    if (obj.resultCode == 0) {
                        console.log("Success");
                        console.log(obj);
                        resolve(obj.payUrl);
                    } else {
                        console.log("Fail");
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on("error", (e) => {
            console.log(`problem with request: ${e.message}`);
            reject(e);
        });

        console.log("Sending....");
        req.write(requestBody);
        req.end();
    });
};

module.exports = momopayment;