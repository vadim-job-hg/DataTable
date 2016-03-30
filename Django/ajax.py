from django.views.generic import TemplateView
from sitename.models import Modelname1, Modelname2, Modelname3
from sitename.helpviews import ajax

class DataTablesAjax(ajax.JSONResponseMixin, ajax.AjaxResponseMixin, sitename):
    json_response = {}
    allowed_methods = {'method1':Modelname1, 'method2':Modelname2, 'method3':Modelname3}
    column_list = {
        'method1':["field1", "field2", "field3"],
        'method2':["field1", "field2", "field3"],
        'method3':["field1", "field2", "field3"],
    }
    current_method = None
    def get_ajax(self, request, name, *args, **kwargs):
        if(name and name in self.allowed_methods):
            self.current_method = name
            method_name = 'dt_' + name
            func = getattr(self, method_name, None)
            if func:
                self.json_response = func(request, self.allowed_methods[name])
            else:
                filter = self.filter(request, self.allowed_methods[name])
                self.json_response = self.json_format(request, filter['list'], filter['count'])
        return self.render_json_response(self.json_response)

    #def dt_method1(self, request, model):
    #    filter = self.filter(request, model)
    #    return self.json_format(request, filter['list'], filter['count'])

    def filter(self, request, model):
        objects_temp = model.objects
        values = {}
        for field in model._meta.fields:
            if field.name in request.GET:
                values[field.name] = request.GET[field.name]
        objects = objects_temp.filter(**values).values(*self.column_list[self.current_method])[int(request.GET['iDisplayStart']):(int(request.GET['iDisplayStart']) + int(request.GET['iDisplayLength']))]
        count = objects_temp.values(*self.column_list[self.current_method]).count()
        response =  {'list':objects, 'count':count}
        return response


    def json_format(self, request, query_result, count):
        result = {}
        result['iTotalDisplayRecords'] = count
        result['sEcho'] = int(request.GET['sEcho'])
        result['aaData'] = []
        for item in query_result:
            cols = []
            for column in self.column_list[self.current_method]:
                cols.append(item[column])
            result['aaData'].append(cols)
        return result
