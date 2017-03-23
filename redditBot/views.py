from django.shortcuts import render
from django.http import HttpResponse
from redditBot.models import subData, redditPost
import redditBot.script
import datetime
import praw #version 3.5.0
from scipy import stats
import pdb

def index(request):
    #pdb.set_trace()
    if request.method == "POST":
        r = praw.Reddit(user_agent = "u/dee-san's Listmaker")
        timeFrame = request.POST.get("timeChoice", None)
        passList = []
        for sub in (request.POST.getlist('checks')):
            subPostsList = []
            myEntry = subData.objects.get(title = sub)
            averageScore = 0
            sigma = 0
            subSearch = r.get_subreddit(sub)
            if timeFrame == "Hour":
                subPostsList = subSearch.get_top_from_hour(limit = 25)
                averageScore = myEntry.hourMean
                sigma = myEntry.hourSigma
            elif timeFrame == "Day":
                subPostsList = subSearch.get_top_from_day(limit = 25)
                averageScore = myEntry.dayMean
                sigma = myEntry.daySigma
            elif timeFrame == "Week":
                subPostsList = subSearch.get_top_from_week(limit = 25)
                averageScore = myEntry.weekMean
                sigma = myEntry.weekSigma
            elif timeFrame == "Month":
                subPostsList = subSearch.get_top_from_month(limit = 25)
                averageScore = myEntry.monthMean
                sigma = myEntry.yearSigma
            elif timeFrame == "Year":
                subPostsList = subSearch.get_top_from_year(limit = 25)
                averageScore = myEntry.yearMean
                sigma = myEntry.yearSigma
            elif timeFrame == "All":
                subPostsList = subSearch.get_top_from_all(limit = 25)
                averageScore = myEntry.allTimeMean
                sigma = myEntry.allTimeSigma
				
            

            for post in subPostsList:
                thisPost = redditPost(title = post.title, inSub = sub, score = post.score, author = post.author, url = post.url, commentsUrl = post.permalink, creationDate = datetime.date.fromtimestamp(post.created))
				#outstandingness = post.score / averageScore, percentile = (stats.norm.cdf((post.score - averageScore) / sigma) * 100),                #passList.append(redditPost(title = post.title, inSub = sub, score = post.score, author = post.author, url = post.url, outstandingness = post.score / averageScore, percentile = (stats.norm.cdf((post.score - averageScore) / sigma) * 100), commentsUrl = post.permalink, creationDate = datetime.date.fromtimestamp(post.created)))
                if averageScore == 0:
                    postOutstandingness = None
                else: postOutstandingness = post.score / averageScore

                if sigma == 0:
                    postPercentile = None
                else: postPercentile = (stats.norm.cdf((post.score - averageScore) / sigma) * 100)

                thisPost.outstandingness = postOutstandingness
                thisPost.percentile = postPercentile
                passList.append(thisPost)
					
				


        passList.sort(key = lambda x: x.percentile, reverse = True)

        return render(request, "redditBot/basic.html", {"posts": passList})
    else:
        return render(request, "redditBot/basic.html")

def addStuff(request):
    list1 = ["programming", "python", "learnPython", "learnProgramming"]

    for el in list1:
        print("getting " + el)
        redditBot.script.getAverageScore(el)
    return HttpResponse("<p>All done!</p>")
