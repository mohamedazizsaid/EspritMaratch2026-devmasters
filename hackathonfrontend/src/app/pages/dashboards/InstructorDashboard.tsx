import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StatsCard } from '../../components/StatsCard';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { StudentProfileModal } from '../../components/StudentProfileModal';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar, 
  Search,
  Bot,
  Send,
  MessageSquare,
  Loader2,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { chatbotService } from '../../../services/chatbot.service';
import { useTranslation } from '../../lib/i18n';
import type { Language } from '../../lib/i18n';
import type { ChatHistory } from '../../lib/types';

// ─── TTS / STT helpers for chatbot ──────────────────────────────
const CHAT_TTS_LOCALES: Record<Language, string> = {
  fr: 'fr-FR', en: 'en-US', ar: 'ar-SA', es: 'es-ES',
};

interface Formation {
  id: any;
  nom_formation: string;
  description?: string;
  date_creation?: string;
  statut?: string;
  students?: number;
  completion?: number;
}

interface Eleve {
  id?: string;
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  avatar?: string;
  date_naissance?: string | Date;
  telephone?: string;
  adresse?: string;
  date_inscription?: string | Date;
  statut?: string;
  progress?: number;
}

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const ttsLocale = CHAT_TTS_LOCALES[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [students, setStudents] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [formateurId, setFormateurId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Eleve | null>(null);
  const [seances, setSeances] = useState<any[]>([]);
  const [loadingSeances, setLoadingSeances] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Chatbot
  const [chatMessage, setChatMessage] = useState('');
  const [chatFormationId, setChatFormationId] = useState('none');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ─── Audio accessibility: TTS (read response) + STT (dictation) ─────
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [dictating, setDictating] = useState(false);
  const dictationRef = useRef<any>(null);

  const handleReadAloud = useCallback((text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error(t('chatbot.ttsNotSupported'));
      return;
    }
    // If already reading this message, stop
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = ttsLocale;
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => setSpeakingMsgId(null);
    u.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(u);
  }, [speakingMsgId, ttsLocale, t]);

  const handleStartDictation = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error(t('chatbot.sttNotSupported'));
      return;
    }
    if (dictationRef.current) {
      dictationRef.current.stop();
      dictationRef.current = null;
      setDictating(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = ttsLocale;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => setDictating(true);
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setChatMessage(prev => prev ? prev + ' ' + transcript : transcript);
      }
    };
    recognition.onerror = () => { setDictating(false); dictationRef.current = null; };
    recognition.onend = () => { setDictating(false); dictationRef.current = null; };
    dictationRef.current = recognition;
    recognition.start();
  }, [ttsLocale, t]);

  // Cleanup TTS/STT on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (dictationRef.current) dictationRef.current.stop();
    };
  }, []);
  useEffect(() => {
    // Récupérer l'ID du formateur connecté depuis localStorage
    const userData = localStorage.getItem('userid');
    if (userData) {
      try {
        console.log('User   :', userData);
        setFormateurId(userData);
      } catch (error) {
        console.error('Erreur lors de la lecture du user:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!formateurId) return;
    
    const fetchSeances = async () => {
      try {
        setLoadingSeances(true);
        const response = await fetch(
          `http://localhost:3000/api/formation/formateur/${formateurId}/seances`
        );
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        console.log('Séances reçues:', data);
        setSeances(data);
      } catch (error) {
        console.error('Erreur lors du chargement des séances:', error);
        setSeances([]);
      } finally {
        setLoadingSeances(false);
      }
    };
    
    fetchSeances();
  }, [formateurId]);

  useEffect(() => {
    if (!formateurId) return;
    
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await fetch(
          `http://localhost:3000/api/eleves/eleves-by-formateur/${formateurId}`
        );
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        console.log('Étudiants reçus:', data);
        
        const mappedStudents: Eleve[] = Array.isArray(data)
          ? data.map((e: any) => ({
              id: e._id || e.id,
              _id: e._id,
              nom: e.nom,
              prenom: e.prenom,
              email: e.email,
              avatar: e.avatar,
              date_naissance: e.date_naissance,
              telephone: e.telephone,
              adresse: e.adresse,
              date_inscription: e.date_inscription,
              statut: e.statut,
              progress: 0,
            }))
          : [];
        
        setStudents(mappedStudents);
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    fetchStudents();
  }, [formateurId]);

  // Fetch presence-based progression for students
  useEffect(() => {
    if (!formateurId || students.length === 0) return;

    const fetchProgress = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/formation/formateur/${formateurId}/student-progress`
        );
        if (!response.ok) return;
        const progressData: Record<string, number> = await response.json();
        
        setStudents(prev =>
          prev.map(s => ({
            ...s,
            progress: progressData[s._id || s.id || ''] ?? s.progress ?? 0,
          }))
        );
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    };

    fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formateurId, students.length]);

  useEffect(() => {
    if (!formateurId) return;
    const fetchFormations = async () => {
      try {
        setLoading(true);
        console.log('Fetching formations for formateur ID:', formateurId);

        const response = await fetch(`http://localhost:3000/api/formation/formateur/${formateurId}`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        console.log('Formations reçues:', data);
        
        // Mapper les données reçues pour matcher la structure du composant
        const mappedFormations: Formation[] = Array.isArray(data) ? data.map((f: any) => ({
          id: f._id || f.id,
          nom_formation: f.nom_formation,
          description: f.description,
          date_creation: f.date_creation,
          statut: f.statut,
          students: f.students || 0,
          completion: f.completion || 0,
        })) : [];
        
        setFormations(mappedFormations);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
        // Garder les données de test en cas d'erreur
        const fallbackFormations: Formation[] = [
          {
            id: '1',
            nom_formation: 'Développement Web Full-Stack',
            description: 'Formation complète en développement web',
            date_creation: new Date('2026-02-10').toISOString(),
            students: 45,
            completion: 72,
          },
          {
            id: '2',
            nom_formation: 'React Avancé',
            description: 'Approfondissement des concepts React',
            date_creation: new Date('2026-02-08').toISOString(),
            students: 38,
            completion: 85,
          },
          {
            id: '3',
            nom_formation: 'Node.js et API REST',
            description: 'Backend avec Node.js et création d\'API',
            date_creation: new Date('2026-02-12').toISOString(),
            students: 42,
            completion: 68,
          },
          {
            id: '4',
            nom_formation: 'TypeScript Mastery',
            description: 'Maîtrise avancée de TypeScript',
            date_creation: new Date('2026-02-15').toISOString(),
            students: 31,
            completion: 91,
          },
        ];
        setFormations(fallbackFormations);
        toast.error(t('instructor.cannotLoadFormations'));
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [formateurId]);

  // Mock data
  const stats = [
    {
      title: t('instructor.activeFormations'),
      value: formations.length.toString(),
      description: t('instructor.activeFormationsDesc'),
      icon: BookOpen,
      trend: { value: '12%', isPositive: true },
    },
    {
      title: t('instructor.totalStudents'),
      value: students.length.toString(),
      description: t('instructor.totalStudentsDesc'),
      icon: Users,
      trend: { value: '8%', isPositive: true },
    },
    {
      title: t('instructor.completionRate'),
      value: formations.length > 0 
        ? Math.round(formations.reduce((acc, f) => acc + (f.completion || 0), 0) / formations.length) + '%'
        : '0%',
      description: t('instructor.completionRateDesc'),
      icon: TrendingUp,
      trend: { value: '5%', isPositive: true },
    },
    {
      title: t('instructor.sessionsThisMonth'),
      value: formations.length.toString(),
      description: t('instructor.sessionsThisMonthDesc'),
      icon: Calendar,
    },
  ];

  // ===== CHATBOT HANDLERS =====
  const currentUserId = formateurId;
  const loadChatHistory = useCallback(async () => {
    setChatLoading(true);
    try {
      const h = await chatbotService.getHistory(50);
      // Filtrer pour n'afficher que les messages du user connecté
      const filtered = currentUserId
        ? h.filter((c: any) => {
            const cUserId = typeof c.userId === 'object' ? c.userId._id || c.userId : c.userId;
            return cUserId === currentUserId;
          })
        : h;
      setChatHistory(filtered);
    } catch {
      // silently fail – history may be empty
    } finally {
      setChatLoading(false);
    }
  }, [currentUserId]);

  const handleSendChat = async () => {
    if (!chatMessage.trim() || chatSending) return;
    const msg = chatMessage.trim();
    setChatSending(true);
    try {
      await chatbotService.ask({
        message: msg,
        formationId: chatFormationId === 'none' ? undefined : chatFormationId,
      });
      setChatMessage('');
      await loadChatHistory();
      // scroll to bottom after render
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (e: any) {
      toast.error(e.message || t('chatbot.chatError'));
    } finally {
      setChatSending(false);
    }
  };

  const handleDeleteChat = async (recordId: string) => {
    try {
      await chatbotService.deleteChatRecord(recordId);
      setChatHistory(prev => prev.filter(c => c._id !== recordId));
      toast.success(t('chatbot.deleted'));
    } catch (e: any) {
      toast.error(e.message || t('chatbot.deleteError'));
    }
  };

  const chatSuggestions = [
    t('chatbot.suggestion1'),
    t('chatbot.suggestion2'),
    t('chatbot.suggestion3'),
    t('chatbot.suggestion4'),
    t('chatbot.suggestion5'),
    t('chatbot.suggestion6'),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="mb-2">{t('instructor.title')}</h1>
          <p className="text-muted-foreground">
            {t('instructor.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4 z-flow-grid">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="flex justify-center gap-2 w-full">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{t('instructor.myFormations')}</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{t('instructor.myStudents')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{t('common.calendar')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="chatbot"
              className="gap-2"
              onClick={() => {
                if (!chatInitialized) {
                  setChatInitialized(true);
                  loadChatHistory();
                }
              }}
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
              <span>Assistant IA</span>
            </TabsTrigger>
          </TabsList>

          {/* Formations Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2>{t('instructor.myFormations')}</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{t('instructor.loadingFormations')}</p>
              </div>
            ) : formations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{t('instructor.noFormationFound')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 z-flow-grid">
                {formations.map((formation: Formation) => (
                  <Card key={formation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle>{formation.nom_formation}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 text-sm">
                          {formation.students || 0} {t('common.students')}
                        </Badge>
                      </div>
                      <CardDescription>
                        {formation.description || t('common.noDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs ${
                            formation.statut === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formation.statut || 'active'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                          <span>Créée le {new Date(formation.date_creation || Date.now()).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/dashboard/instructor/formation/${formation.id}`)}
                      >
                        {t('instructor.viewDetails')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>{t('instructor.myStudents')}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder={t('instructor.searchStudent')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                  aria-label={t('instructor.searchStudent')}
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('common.student')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('common.email')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('instructor.progression')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((student: Eleve) => (
                        <tr key={student._id || student._id} className="hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {`${student.prenom?.[0] || ''}${student.nom?.[0] || ''}`.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.prenom} {student.nom}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress value={student.progress || 0} className="w-20" aria-label={`Progression: ${student.progress || 0}%`} />
                              <span className="text-sm">{student.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsModalOpen(true);
                              }}
                            >
                              {t('instructor.viewProfile')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2>{t('instructor.calendarSessions')}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  {t('common.previous')}
                </Button>
                <Button variant="outline" size="sm" disabled>
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>

            {loadingSeances ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{t('instructor.loadingCalendar')}</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  {/* Calendar Grid */}
                  <div className="space-y-4">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-2">
                      {[t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')].map((day) => (
                        <div key={day} className="text-center font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay: any = new Date(year, month, 1).getDay();
                        const lastDay = new Date(year, month + 1, 0).getDate();
                        const daysInPrevMonth = new Date(year, month, 0).getDate();
                        
                        const days = [];
                        
                        // Previous month days
                        for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--) {
                          days.push({
                            day: daysInPrevMonth - i + 1,
                            currentMonth: false,
                            date: new Date(year, month - 1, daysInPrevMonth - i + 1),
                          });
                        }
                        
                        // Current month days
                        for (let i = 1; i <= lastDay; i++) {
                          days.push({
                            day: i,
                            currentMonth: true,
                            date: new Date(year, month, i),
                          });
                        }
                        
                        // Next month days
                        const remainingDays = 42 - days.length;
                        for (let i = 1; i <= remainingDays; i++) {
                          days.push({
                            day: i,
                            currentMonth: false,
                            date: new Date(year, month + 1, i),
                          });
                        }
                        
                        return days.map((dayItem) => {
                          const dateStr = dayItem.date.toISOString().split('T')[0];
                          const daySeances = seances.filter(
                            (s: any) => s.date_prevue && new Date(s.date_prevue).toISOString().split('T')[0] === dateStr
                          );
                          
                          return (
                            <div
                              key={`${dayItem.date.getTime()}`}
                              className={`min-h-24 p-2 border border-border rounded-lg transition-all duration-300 hover:shadow-md ${
                                dayItem.currentMonth ? 'bg-background' : 'bg-muted/30'
                              } ${daySeances.length > 0 ? 'ring-2 ring-primary/50' : ''}`}
                            >
                              <div className={`text-sm font-medium mb-1 ${dayItem.currentMonth ? '' : 'text-muted-foreground'}`}>
                                {dayItem.day}
                              </div>
                              {daySeances.slice(0, 2).map((seance: any, idx: number) => (
                                <div
                                  key={seance._id}
                                  className="animate-fade-in text-xs bg-primary/10 text-primary p-1 rounded mb-1 truncate hover:bg-primary/20 cursor-pointer transition-colors"
                                  title={seance.titre}
                                >
                                  {seance.titre}
                                </div>
                              ))}
                              {daySeances.length > 2 && (
                                <div className="text-xs text-muted-foreground font-medium">
                                  +{daySeances.length - 2} {t('common.more')}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Séances list */}
            {seances.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t('instructor.upcomingSessions')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {seances
                    .filter((s: any) => s.date_prevue)
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.date_prevue as unknown as string).getTime();
                      const dateB = new Date(b.date_prevue as unknown as string).getTime();
                      return dateA - dateB;
                    })
                    .slice(0, 6)
                    .map((seance: any) => (
                      <Card key={seance._id} className="animate-slide-up hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{seance.titre}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {seance.formation}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>
                              {new Date(seance.date_prevue).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {seance.heure_debut && (
                            <div className="text-sm text-muted-foreground">
                              {t('instructor.schedule')} {seance.heure_debut}
                              {seance.heure_fin ? ` - ${seance.heure_fin}` : ''}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Niveau: {seance.niveau}
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            {t('instructor.viewDetails')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {seances.length === 0 && !loadingSeances && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{t('instructor.noSessionScheduled')}</p>
              </div>
            )}
          </TabsContent>

          {/* ==================== CHATBOT / ASSISTANT IA ==================== */}
          <TabsContent value="chatbot" className="space-y-6">
            {/* Header with animation */}
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" aria-label="En ligne" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t('chatbot.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('chatbot.subtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat area */}
              <Card className="lg:col-span-3 flex flex-col overflow-hidden" role="region" aria-label={t('chatbot.chatArea')}>
                <CardHeader className="border-b border-border/50 bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                        {t('chatbot.conversation')}
                      </CardTitle>
                      <CardDescription>{t('chatbot.conversationDesc')}</CardDescription>
                    </div>
                    {chatHistory.length > 0 && (
                      <Badge variant="secondary" className="tabular-nums">
                        {chatHistory.length} {chatHistory.length > 1 ? t('chatbot.messages') : t('chatbot.message')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                    style={{ maxHeight: '460px', minHeight: '360px' }}
                    role="log"
                    aria-live="polite"
                    aria-label={t('chatbot.history')}
                  >
                    {chatLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 animate-pulse" role="status">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">{t('chatbot.loadingHistory')}</p>
                        <span className="sr-only">{t('chatbot.loadingInProgress')}</span>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-fade-in">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Bot className="h-10 w-10 text-primary/60" aria-hidden="true" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium text-foreground">{t('chatbot.welcome')}</p>
                          <p className="text-sm max-w-sm">{t('chatbot.welcomeDesc')}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {[...chatHistory].reverse().map((ch, idx) => (
                          <div
                            key={ch._id}
                            className="space-y-3 animate-slide-up"
                            style={{ animationDelay: `${Math.min(idx * 50, 300)}ms`, animationFillMode: 'backwards' }}
                          >
                            {/* User message */}
                            <div className="flex justify-end group" role="article" aria-label={t('chatbot.yourMessage')}>
                              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm transition-shadow hover:shadow-md">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ch.userMessage}</p>
                                <div className="flex items-center justify-between gap-3 mt-2">
                                  <time className="text-[11px] opacity-60" dateTime={ch.createdAt}>
                                    {new Date(ch.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </time>
                                  <button
                                    onClick={() => handleDeleteChat(ch._id)}
                                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                                    aria-label={t('chatbot.deleteMessage')}
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {/* AI response */}
                            <div className="flex justify-start" role="article" aria-label={t('chatbot.assistantResponse')}>
                              <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                                <div className="flex items-center justify-between gap-1.5 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                      <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                                    </div>
                                    <span className="text-xs font-semibold text-primary">Gemini</span>
                                  </div>
                                  <button
                                    onClick={() => handleReadAloud(ch.assistantResponse, ch._id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                      speakingMsgId === ch._id
                                        ? 'bg-primary/15 text-primary animate-pulse'
                                        : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                                    }`}
                                    aria-label={speakingMsgId === ch._id ? t('chatbot.stopListening') : t('chatbot.listenResponse')}
                                    title={speakingMsgId === ch._id ? t('chatbot.stopListening') : t('chatbot.listenResponse')}
                                  >
                                    {speakingMsgId === ch._id ? (
                                      <VolumeX className="h-3.5 w-3.5" />
                                    ) : (
                                      <Volume2 className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden sm:inline">
                                      {speakingMsgId === ch._id ? t('chatbot.stopListening') : t('chatbot.listenResponse')}
                                    </span>
                                  </button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{ch.assistantResponse}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="border-t border-border/50 bg-background p-4 flex-shrink-0 space-y-3">
                    {/* Formation context selector */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="chat-formation-select" className="sr-only">{t('chatbot.formationContext')}</label>
                      <Select value={chatFormationId} onValueChange={setChatFormationId}>
                        <SelectTrigger id="chat-formation-select" className="w-full text-sm h-9" aria-label={t('chatbot.selectFormation')}>
                          <SelectValue placeholder={t('chatbot.noFormationContext')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('chatbot.noFormationGeneral')}</SelectItem>
                          {formations.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.nom_formation}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message input */}
                    <div className="flex gap-2">
                      <label htmlFor="chat-input" className="sr-only">{t('chatbot.yourMessage')}</label>
                      <Textarea
                        id="chat-input"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={dictating ? t('chatbot.micListening') : t('chatbot.placeholder')}
                        rows={2}
                        className="flex-1 resize-none text-sm transition-all focus:ring-2 focus:ring-primary/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat();
                          }
                        }}
                        disabled={chatSending}
                        aria-label={t('chatbot.writeMessage')}
                      />
                      {/* Mic dictation button */}
                      <Button
                        variant={dictating ? 'default' : 'outline'}
                        onClick={handleStartDictation}
                        className={`self-end h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                          dictating
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-2 ring-red-500/30'
                            : 'hover:shadow-md hover:scale-105'
                        }`}
                        aria-label={dictating ? t('chatbot.stopDictation') : t('chatbot.speakMessage')}
                        title={dictating ? t('chatbot.stopDictation') : t('chatbot.speakMessage')}
                      >
                        {dictating ? (
                          <MicOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Mic className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        onClick={handleSendChat}
                        disabled={chatSending || !chatMessage.trim()}
                        className="self-end h-10 w-10 p-0 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 disabled:scale-100"
                        aria-label={chatSending ? t('common.sending') : t('common.sendMessage')}
                        title={t('chatbot.sendEnter')}
                      >
                        {chatSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center" aria-hidden="true">
                      {t('chatbot.enterHint')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions sidebar */}
              <div className="space-y-4">
                <Card role="complementary" aria-label="Suggestions de questions">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t('chatbot.suggestions')}
                    </CardTitle>
                    <CardDescription className="text-xs">{t('chatbot.clickToFill')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {chatSuggestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setChatMessage(q)}
                        className="w-full text-left p-3 rounded-lg border border-border/60 text-sm transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 group"
                        aria-label={'Suggestion : ' + q}
                      >
                        <MessageSquare className="h-3 w-3 inline mr-2 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                        <span className="group-hover:text-foreground transition-colors">{q}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick info card */}
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="text-sm font-medium">{t('chatbot.tip')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('chatbot.tipDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {selectedStudent && (
          <StudentProfileModal
            isOpen={isModalOpen}
            student={selectedStudent}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}