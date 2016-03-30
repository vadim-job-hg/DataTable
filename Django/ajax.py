from tipe10ru.views.admintemplate import AdminView
from tipe10ru.models import VkQuotes, VkCourse, VkUsers, VkCourseGroup, VkLesson
from tipe10ru.views.helpviews import ajax

class DataTablesAjax(ajax.JSONResponseMixin, ajax.AjaxResponseMixin, AdminView):
    json_response = {}
    allowed_methods = {'quotes':VkQuotes, 'courses':VkCourse, 'users':VkUsers, 'coursegroup':VkCourseGroup, 'lessons':VkLesson}
    column_list = {
        'quotes':["id", "img", "text", "lesson_order", "visible"],
        'courses':["id", "name", "group", "active"],
        'coursegroup':["id", "name", "flag", "order", "active"],
        'users':["id", "username", "email", "password", "hash"],
        'lessons':["id", "text_num", "name", "number", "course"]
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

    #def dt_quotes(self, request, model):
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
