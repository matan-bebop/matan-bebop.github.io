%:- if(current_predicate(js_script/2)).


мм_розбито_на_прості(Запит, СписокПростих) :-
    мм_ключ(Ключ), Promise := split(Запит, Ключ),
    catch(await(Promise, Vidpovidj), _, fail),
    maplist(dict_dija, Vidpovidj.chastyny, СписокПростих).

dict_dija(Dict, Dict.dija).


мм_беззмістовне_питання(Частина, Запит) :-
    мм_ключ(Ключ),
    Promise := is_actionless(Частина, Запит, Ключ),
    catch(await(Promise, D), _, fail),
    D.is_real_action < 30.


мм_підходяща(СловаКоманди, Запит) :-
    найкращі_команди(3, [[…]], [СловаКоманди-Оцінка|Гірші],
		     0->3, мм_ранжовані(Запит)),
    Оцінка > 75.

мм_ранжовані(Запит, СловаКоманд, КомандиОцінки) :-
    мм_ключ(Ключ),
    оповідь("Треба проконсультуватися з ноосферою… "), flush_output,
    maplist(слова_стринг, СловаКоманд, СтрКоманд),
    Promise := interpret(Запит, СтрКоманд, Ключ),
    catch(await(Promise, Vidpovidj), _, fail),
    оповідь("Еее… "), flush_output,
    maplist(dict_variant_pair, Vidpovidj, КомандиОцінки).

dict_variant_pair(Dict, СловаКоманди-Dict.ocinka) :-
    розбити_на_слова(Dict.komanda, СловаКоманди).

слова_стринг(Слова, Стр) :- atomic_list_concat(Слова, " ", Стр).


%:- endif.
