from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username


class EmployeeIcon(models.Model):
    image = models.ImageField(upload_to='user_icons/')


class Employee(models.Model):
    full_name = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    hire_date = models.DateField()
    email = models.EmailField()
    supervisor = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subordinates')
    icon = models.ForeignKey(EmployeeIcon, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.full_name

    class Meta:
        ordering = ['full_name']