from django.db import models

class personChange(models.Model):
    name = models.CharField(max_length = 50)
    ones = models.PositiveSmallIntegerField()
    fives = models.PositiveSmallIntegerField()
    tens = models.PositiveSmallIntegerField()
    twenties = models.PositiveSmallIntegerField()
    fifties = models.PositiveSmallIntegerField()
    hundreds = models.PositiveSmallIntegerField()

    def __STR__(self):
        return self.name
