import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Menu, Search, CheckCircle2, X, Edit2, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { useEventsStore, Event } from '../stores/eventsStore';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

function Calendar() {
  const { events, completeTask, deleteEvent, updateEvent, canModifyEvent } = useEventsStore();
  const currentUser = useAuthStore((state) => state.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [view, setView] = useState<'tasks' | 'events'>('tasks');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handleTaskCompletion = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.type === 'task' && !event.completed && currentUser) {
      completeTask(event.id);
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 2000);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
               (view === 'tasks' ? event.type === 'task' : event.type === 'event');
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const canCompleteTask = (event: Event) => {
    if (!currentUser || event.type !== 'task' || event.completed) return false;
    return event.assignee?.toLowerCase() === currentUser.name.toLowerCase();
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Points Animation */}
      <AnimatePresence>
        {showPoints && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Trophy className="w-5 h-5" />
            <span>+1 point !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={previousMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex bg-gray-800 rounded-lg p-1 self-center">
              <button
                onClick={() => setView('tasks')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'tasks' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tâches
              </button>
              <button
                onClick={() => setView('events')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'events' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Événements
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-2 py-4">
        {/* Week days */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, index) => (
            <div key={`weekday-${index}`} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            
            return (
              <motion.div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] p-1 rounded-lg cursor-pointer transition-all border ${
                  !isCurrentMonth ? 'opacity-40 border-gray-800' :
                  isSelected ? 'border-blue-500 bg-blue-500/10' :
                  isToday(day) ? 'border-blue-500/50 bg-blue-500/5' :
                  'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'text-blue-400' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className={`text-xs px-1.5 py-1 rounded-md ${event.color || 'bg-gray-700'} flex items-center justify-between group truncate`}
                    >
                      <div className="flex-1 min-w-0 truncate">
                        {format(new Date(event.date), 'HH:mm')} {event.title}
                      </div>
                      {event.type === 'task' && (
                        <button
                          onClick={(e) => handleTaskCompletion(event, e)}
                          className={`ml-1 transition-colors ${
                            event.completed 
                              ? 'text-green-400' 
                              : canCompleteTask(event)
                                ? 'text-gray-400 hover:text-green-400'
                                : 'text-gray-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400 pl-1">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal - Optimisé pour mobile */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 pb-24">
                <div className="sticky top-0 bg-gray-900 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                      </h2>
                      <p className="text-gray-400">
                        {getEventsForDate(selectedDate).length} {view === 'tasks' ? 'tâches' : 'événements'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl ${event.color || 'bg-gray-800'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="text-sm space-x-2 text-gray-300">
                            <span>{format(new Date(event.date), 'HH:mm')}</span>
                            {event.assignee && (
                              <>
                                <span>•</span>
                                <span>{event.assignee}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.type === 'task' && !event.completed && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleTaskCompletion(event, e)}
                              className={`p-2 rounded-lg transition-colors ${
                                canCompleteTask(event)
                                  ? 'bg-gray-700/50 hover:bg-green-500/20 hover:text-green-400'
                                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </motion.button>
                          )}
                          {canModifyEvent(event.id) && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateEvent(event)}
                                className="p-2 rounded-lg bg-gray-700/50 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                              >
                                <Edit2 className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  deleteEvent(event.id);
                                  setSelectedDate(null);
                                }}
                                className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                      {event.type === 'task' && event.completed && (
                        <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tâche complétée</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;