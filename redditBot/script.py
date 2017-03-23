from redditBot.models import subData
import praw
import math

def getAverageScore(subArgument):
	if subData.objects.filter(title = subArgument).exists():
		print(subArgument + " db entry already exists")
		return
	else:
		secretList = {}

		timeSearchList = ["hour", "day", "week", "month", "year", "all"]
		for timeSearch in timeSearchList:
			secretList[timeSearch] = {}

			r = praw.Reddit(user_agent = "Stephen's test 'WHY IS THIS HERE WHAT DOES IT DO?'")
			subreddit = r.get_subreddit(subArgument)
			subredditPosts = []

			if timeSearch == "hour":
				subredditPosts = subreddit.get_top_from_hour(limit = 25)
			elif timeSearch == "day":
				subredditPosts = subreddit.get_top_from_day(limit = 25)
			elif timeSearch == "week":
				subredditPosts = subreddit.get_top_from_week(limit = 25)
			elif timeSearch == "month":
				subredditPosts = subreddit.get_top_from_month(limit = 25)
			elif timeSearch == "year":
				subredditPosts = subreddit.get_top_from_year(limit = 25)
			elif timeSearch == "all":
				subredditPosts = subreddit.get_top_from_all(limit = 25)
			else:
				print("no")
				return

			intList = []
			count = 0

			for submission in subredditPosts:
				intList.append(submission.score)
				count +=1

			average = sum(intList) / count
			sigma = 0
			for score in intList:
				sigma += ((score - average)**2)
			sigma = math.sqrt(sigma / count)
			secretList[timeSearch]["average"] = average
			secretList[timeSearch]["sigma"] = sigma

		entry = subData(title = subArgument, hourMean = secretList["hour"]["average"], hourSigma = secretList["hour"]["sigma"], dayMean = secretList["day"]["average"], daySigma = secretList["day"]["sigma"], weekMean = secretList["week"]["average"], weekSigma = secretList["week"]["sigma"], monthMean = secretList["month"]["average"], monthSigma = secretList["month"]["sigma"], yearMean = secretList["year"]["average"], yearSigma = secretList["year"]["sigma"], allTimeMean = secretList["all"]["average"], allTimeSigma = secretList["all"]["sigma"])
		print(entry)
		print(subArgument + " saved")
		entry.save()
