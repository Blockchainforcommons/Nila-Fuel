"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
var fuels_1 = require("fuels");
var types_1 = require("./types");
// import abiJson 
var CreditpredicateAbi__factory_1 = require("./predicate_types/factories/CreditpredicateAbi__factory");
// modern module syntax
function wallet(e, context, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var CONTRACTID, provider, wallet, chainId, configurable, predicate, contract, address, asset, id, resp, response, sign, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CONTRACTID = '0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a';
                    // let e = {
                    //   type: 100,
                    //   duration: 3,
                    //   SK: '0x03c1b740fdddbe67edae30443b969da79aa8c0d055486fe185b82f34a719c2ca',
                    //   sponsors: '[{"business_name": "Arani Food Export", "pk": "fuel172tmgjslwr6cpteru7fw2qe0wprwfrz9mztcrfhefv6q8h69dtdsurwm6v", "name": "mr. Krishnan H", "phonenumber": "+31627257049"}, {"business_name": "Magarantham Ltd FPO", "pk": "fuel172tmgjslwr6cpteru7fw2qe0wprwfrz9mztcrfhefv6q8h69dtdsurwm6v", "name": "mr. Anandan Pandurangan", "phonenumber": "+316272570490"}]',
                    //   amount: 0,
                    //   rate: 0,
                    //   phone: 'whatsapp:+31627257049'
                    // }
                    console.log('event', e);
                    provider = new fuels_1.Provider('https://beta-3.fuel.network/graphql');
                    wallet = fuels_1.Wallet.fromPrivateKey(e['SK'], provider);
                    return [4 /*yield*/, provider.getChainId()];
                case 1:
                    chainId = _a.sent();
                    configurable = {
                        ADDRESS_ONE: CONTRACTID,
                        ADDRESS_TWO: (0, fuels_1.getRandomB256)(),
                        ADDRESS_THREE: (0, fuels_1.getRandomB256)(),
                        REQUIRED_SIGNATURES: 2,
                        AMOUNT: e['amount'],
                        ASSET: e['asset'],
                        RECEIVER: wallet.address,
                    };
                    predicate = CreditpredicateAbi__factory_1.CreditpredicateAbi__factory.createInstance(chainId, provider);
                    predicate.setData((configurable.ADDRESS_ONE,
                        configurable.ADDRESS_TWO,
                        configurable.ADDRESS_THREE,
                        configurable.AMOUNT,
                        configurable.ASSET,
                        configurable.RECEIVER,
                        configurable.REQUIRED_SIGNATURES));
                    console.log('predicate', predicate.address);
                    if (!(e['type'] == 100)) return [3 /*break*/, 2];
                    contract = types_1.CreditAbi__factory.connect(CONTRACTID, wallet);
                    address = { value: predicate.address.toB256() };
                    asset = { value: e['asset'] };
                    id = { Address: address };
                    resp = contract.functions.borrow(e['amount'], e['rate'], asset, e['type'], e['duration'], id).call();
                    console.log(resp);
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            input: address,
                        }),
                    };
                    callback(null, response);
                    return [3 /*break*/, 5];
                case 2:
                    if (!(e['type'] == 101)) return [3 /*break*/, 5];
                    return [4 /*yield*/, wallet.transfer(predicate.address, 0)];
                case 3:
                    sign = _a.sent();
                    return [4 /*yield*/, sign.waitForResult()];
                case 4:
                    _a.sent();
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            input: 'success',
                        }),
                    };
                    callback(null, response);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.wallet = wallet;
//# sourceMappingURL=handler.js.map