%:- if(current_predicate(js_script/2)).


мм_розбито_на_прості(Запит, СписокПростих) :-
    мм_ключ(Ключ), Promise := split(Запит, Ключ), await(Promise, Vidpovidj),
    maplist(dict_dija, Vidpovidj.chastyny, СписокПростих).

dict_dija(Dict, Dict.dija).


мм_беззмістовне_питання(Частина, Запит) :-
    мм_ключ(Ключ),
    Promise := is_actionless(Частина, Запит, Ключ), await(Promise, D),
    D.is_real_action < 30.


мм_підходяща(СловаКоманди, Запит) :-
    write("Вибираю всі команди... "), flush_output,
    найкращі_команди(3, [[]], [СловаКоманди-Оцінка|Гірші],
		     0->3, мм_ранжовані(Запит)),
    writeln("Обрано найкращі."),
    writeln([СловаКоманди-Оцінка|Гірші]),
    Оцінка > 75.

мм_ранжовані(Запит, [СловаПершої|СловаІншихК], КомандиОцінки) :-
    мм_ключ(Ключ),
    оповідь("Еее… "), flush_output,
    with_output_to(string(КомандиСтр), (
        вивести_команду("", СловаПершої),
        maplist(вивести_команду(", "), СловаІншихК))),
    Promise := interpret(Запит, КомандиСтр, Ключ), await(Promise, Vidpovidj),
    maplist(dict_variant_pair, Vidpovidj.komandy, КомандиОцінки),
    writeln(КомандиОцінки).

dict_variant_pair(Dict, СловаКоманди-Dict.ocinka) :-
    розбити_на_слова(Dict.komanda, СловаКоманди).

вивести_команду(ПередСтр, [ПершеСлово|ІншіСлова]) :-
    write(ПередСтр), write(ПершеСлово), maplist(format(" ~a"), ІншіСлова).


%:- endif.
