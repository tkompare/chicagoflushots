#Chicago Flu Shots

##aka "Flu Shot Finder"

##NOTICE: THE FLU SHOTS APP WAS REWRITTEN FOR THE 2015-16 SEASON.

This application was developed for the Chicago Department of Public Health (CDPH)
to help Chicago residents locate and find public transportation to CDPH's free
flu shot clinic events.

[http://chicagoflushots.org/](http://chicagoflushots.org/)

##BACKGROUND
In mid-2012, I went to a weekly meeting of civic coders where several city agencies 
presented. They asked for our help in building interesting applications around
their available data. I was interested in the free flu shot clinic locations
since flu season was coming up fast, and I had attended a free flu shot event
in the past.

I built a prototype application and advertised it via Twitter. the Chicago 
Department of Public Health (CDPH), the Mayor's Office, and a few other 
civic coders, mainly Juan-Pablo Velez, noticed the tweet. Before I knew 
it, Juan-Pablo brokered a meeting between CDPH, the Mayor's Office, and 
ourselves. The meeting was positive and I began in ernest to polish up 
the application.

##BITS AND BYTES
Chicago Flu Shots events data are maintained and published to a Google Fusion
Table by CDPH. This code uses the Google Maps API to retrieve those events. We use
Google Fusion Tables because it is easy to update on demand and there is no
administrative overhead and delay as there is with the City of Chicago Data Portal.
Using a Google Fusion Table also make this code more usable by other who do not
use the same data platform as the City of Chicago.

###The Fusion Table:
[https://www.google.com/fusiontables/DataSource?docid=1leqPq9hrsGhnE8NoT00YZn1ITTzhK6BhrF8LNL4](https://www.google.com/fusiontables/DataSource?docid=1leqPq9hrsGhnE8NoT00YZn1ITTzhK6BhrF8LNL4)

##MADD PROPZ
This web application could not have been originally as well executed without 
the sage feedback and assistance of Juan-Pablo Velez and Derek Eder. Thanks 
also to Smart Chicago for hosting this web application. **Raed Mansour** (of CDPH)
has been my advocate and full partner on the inside. Without his advocacy, this
fairly unique relationship and this application would not work.

##ERRATA
'CDPH_HC_Logo.jpg', 'healthychicago_small_trans.png', and 
'healthychicago_small_trans_bw.png' image files are for the City of 
Chicago's own use and **do not fall under the license found on LICENSE.TXT.** 
You must replace it in your own implementation. It is left here to help you 
use this code.

This code should be fairly easy to take and use by other government agencies
offering flu shot clinic events. If you would like any advice on 
implementing this code, drop me a line.

##CODE REPOSITORY NOTES
I have been exceptionally terrible at organizing the code repository for Chicago Flu
Shots and it has not gotten proper love over the last few years. I plan on 
changing my ways.

You all should **expect a branch each year** with the naming 
convention of 'vYYYY-YY'. For example: 'v2015-16' for the 2015-2016 season's
round of updates. **Each's year's updates will be merged back into the 'master'
branch when development is complete.** This will generally occur in the **late 
Summer or early Autumn** every year. Smaller bug fix branches may be created
at anytime and merged back into 'master' when the bug is squashed.

Tom Kompare
e: tom@kompare.us
t: @tomkompare 