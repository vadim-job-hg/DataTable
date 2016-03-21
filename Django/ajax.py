from tipe10ru.views.admintemplate import AdminView
from tipe10ru.models import VkQuotes, VkQuotesHidden, VkQuotesSecret, VkUsers
from tipe10ru.views.helpviews import ajax
import types

class DataTablesAjax(ajax.JSONResponseMixin, ajax.AjaxResponseMixin, AdminView):
    json_response = {}
    allowed_methods = ['quotes']
    model = None
    column_list = {}
    def get_ajax(self, request, name, *args, **kwargs):
        if(name and name in self.allowed_methods):
            method_name = 'dt_' + name # e.g. given attribute name "baz" call method "calculate_baz"
            func = getattr(self, method_name)           # find method that located within the class
            self.json_response = func(request)
        return self.render_json_response(self.json_response)

    def dt_quotes(self, request):
        self.column_list = ["id", "img", "text", "lesson_order", "visible"]
        filter = self.filter(request, VkQuotes)
        return self.json_format(request, filter['list'], filter['count'])

    def filter(self, request, model):
        objects = model.objects.values(*self.column_list)[int(request.GET['iDisplayStart']):(int(request.GET['iDisplayStart']) + int(request.GET['iDisplayLength']))]
        #todo проверить оптимально ли выполение среза? Делается выборка из всей БД? [int(request.GET['iDisplayStart']):(int(request.GET['iDisplayStart']) + int(request.GET['iDisplayLength']))]
        count = model.objects.values(*self.column_list).count()
        response =  {'list':objects, 'count':count}
        return response


    def json_format(self, request, query_result, count):
        result = {}
        result['iTotalDisplayRecords'] = count
        result['sEcho'] = int(request.GET['sEcho'])
        result['aaData'] = []
        for item in query_result:
            cols = []
            for column in self.column_list:
                cols.append(item[column])
            result['aaData'].append(cols)
        return result

