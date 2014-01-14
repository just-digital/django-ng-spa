import hashlib
import time
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.conf import settings
from tastypie.models import ApiKey


def make_api_key():
    """ Uses timestamp and secret key salt """
    timestamp = str(time.time())
    return hashlib.sha1(timestamp + ":" + settings.SECRET_KEY).hexdigest()


def create_user_profile(sender, instance, created, **kwargs):
    """ Create an profile entity and API Key for this user """
    if created:
        profile, created = Profile.objects.get_or_create(user=instance)
        apikey, created = ApiKey.objects.get_or_create(user=instance,
                                                       key=make_api_key())


# Connect the function to the signal
post_save.connect(create_user_profile, sender=User)


class Profile(models.Model):
    """ One2One on user model used to store the preferred working hours field """
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
    date = models.DateField(auto_now_add=True, db_index=True)
    duration = models.IntegerField(help_text="Amount of time spent in minutes "
                                             "on this item")

    def __unicode__(self):
        return self.title

    @property
    def undertime(self):
        """ Returns True when the the current duration is shorter than preferred """
        return self.duration < self.user.profile.hours

