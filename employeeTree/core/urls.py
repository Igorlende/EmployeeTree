from django.urls import path
from .views import EmployeeTreeView, LoadTwoBranchSubordinatesView, EmployeeTreeWithChangingBossesView, \
    ChangeSupervisorView, LoadTwoBranchSubordinatesWithChangingBossesView

urlpatterns = [
    path('', EmployeeTreeView.as_view(), name='employee_tree'),
    path('load_two_branch_subordinates/<int:employee_id>/', LoadTwoBranchSubordinatesView.as_view(),
         name='load_two_branch_subordinates'),
    path('load_two_branch_subordinates_with_changing_bosses/<int:employee_id>/',
         LoadTwoBranchSubordinatesWithChangingBossesView.as_view(),
         name='load_two_branch_subordinates_with_changing_bosses'),
    path('employee_tree_with_changing_bosses', EmployeeTreeWithChangingBossesView.as_view(),
         name='employee_tree_with_changing_bosses'),
    path('change_supervisor', ChangeSupervisorView.as_view(), name='change_supervisor')
]
