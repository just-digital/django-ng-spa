from django.db import models
from django.contrib.auth.models import User


#TODO: make a signal to create a user profile, and an API Key on user.save()

class Profile(models.Model):
    user = models.OneToOneField(User, related_name="profile")
    hours = models.IntegerField(default=4, help_text="Preferred amount of working "
                                                     "hours per day")


class Item(models.Model):
    """
    This model entity represents the thing that the user does.
    Ie.  The thing that assigns his/her time to.
    """
    user = models.ForeignKey(User)
    title = models.CharField(max_length=255)
    date = models.DateField(auto_now=True, db_index=True)
    duration = models.IntegerField(help_text="Amount of time spent in minutes "
                                             "on this item")

    def __unicode__(self):
        return self.title

    @property
    def undertime(self):
        """Returns True when the the current duration is shorter than preferred"""
        return self.duration < self.user.profile.preferred_hours



