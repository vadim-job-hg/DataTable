from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from sitename.ajax import DataTablesAjax

urlpatterns = patterns('',
    url(r'^admin/ajax/datatables/(?P<name>\w{0,50})/$',DataTablesAjax.as_view()),
    url(r'^example', TemplateView.as_view(template_name="example.html", model='Model1'), name='example')
)
