from django.db import models

class subData(models.Model):
    title = models.CharField(max_length = 40)
    hourMean = models.FloatField()
    hourSigma = models.FloatField()
    dayMean = models.FloatField()
    daySigma = models.FloatField()
    weekMean = models.FloatField()
    weekSigma = models.FloatField()
    monthMean = models.FloatField()
    monthSigma = models.FloatField()
    yearMean = models.FloatField()
    yearSigma = models.FloatField()
    allTimeMean = models.FloatField()
    allTimeSigma = models.FloatField()

    def __str__(self):
        return self.title

class redditPost(models.Model):
    inSub = models.CharField(max_length = 40)
    title = models.CharField(max_length = 400)
    score = models.IntegerField()
    author = models.CharField(max_length = 40)
    url = models.CharField(max_length = 400)
    outstandingness = models.IntegerField()
    percentile = models.FloatField()
    commentsUrl = models.CharField(max_length = 400)
    creationDate = models.DateField()

    def __str__(self):
        return self.title
