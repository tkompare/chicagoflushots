## Vaccinate Me

**aka "Flu Shot Finder"**

### NOTICE: "VACCINATE ME" IS BEING REWRITTEN FOR THE 2018-19 SEASON

This application was developed for the Chicago Department of Public Health (CDPH) to help Chicago residents identify a convenient no cost CDPH flu shot event.

[http://chicagoflushots.org/](http://chicagoflushots.org/)

### BACKGROUND
In mid-2012, I went to a weekly meeting of civic coders where several city agencies presented. They asked for our help in building interesting applications around their available data. I was interested in the free flu shot clinic locations since flu season was coming up fast, and I had attended a free flu shot event in the past.

I built a prototype application and advertised it via Twitter. The Chicago Department of Public Health (CDPH), the Mayor's Office, and a few other civic coders, mainly Juan-Pablo Velez, noticed the tweet. Before I knew it, Juan-Pablo brokered a meeting between CDPH, the Mayor's Office, and ourselves. The meeting was positive and I began in ernest to polish up the application.

### BITS AND BYTES
Vaccination events data are maintained and published as a Google Sheet. This code uses the Google Sheets API to retrieve event data. We use Google Sheets because it is easy to update on demand and there is no administrative overhead and delay. Using a Google Sheet also make this code more usable by agencies that have little to no technology resources.

#### Google Sheet Example:
[https://docs.google.com/spreadsheets/d/1_HTPvKSlLnWP__Lq_r-mCYKGcLau4Z7MmlsSyCMc454/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1_HTPvKSlLnWP__Lq_r-mCYKGcLau4Z7MmlsSyCMc454/edit?usp=sharing)

### MADD PROPZ
This web application could not have been originally built or executed without the sage feedback and assistance of Juan-Pablo Velez and Derek Eder. Thanks also to Smart Chicago for hosting this web application. **Raed Mansour** (of CDPH) has been my advocate and full partner on the inside. Without his advocacy, this fairly unique relationship and this application would not work.

### CODE NOTES
This a HTML/CSS/JavaScript web application. It does have one small PHP (ical.php) file to construct an iCal file for users who want a calendar reminder of one-off events. This PHP file should be simple enough to rewrite in whatever server-side language is available in your environment.

If you want to reuse this code for your city/county/province/state, a good place to start is in main.js and altering the properties of the "Default" object at the top of the file.

You probably also want to change the stuff found in the Flushots.setMapSocial function.

I try to use meaningful variable names, so hopefully the code won't be too hard to follow.

### CODE REPOSITORY NOTES
I have been exceptionally terrible at organizing the code repository for Chicago Flu Shots and it has not gotten proper love over the last few years. I plan on changing my ways.

Branches will have a naming convention of 'vYYYY-YY'. For example: 'v2018-19' for the 2018-2019 season's round of updates. **Each's year's branch updates will be merged back into the 'master' branch when development is complete.** This will generally occur in the **late Summer or early Autumn**. Smaller bug fix branches may be created at anytime and merged back into 'master' when the bug is squashed.

### ERRATA
'CDPH_HC_Logo.jpg', 'healthychicago_small_trans.png', and 'healthychicago_small_trans_bw.png' image files are for the City of Chicago's own use and **do not fall under the license found on LICENSE.TXT.** You must replace it in your own implementation. It is left here to help you use this code.

This code should be fairly easy to take and use by other government agencies offering flu shot clinic events. If you would like any advice on implementing this code, drop me a line.

Tom Kompare
e: [tom@kompare.us](mailto:tom@kompare.us)
t: [@tomkompare](//twitter.com/tomkompare)