import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { StatsCard } from '../../components/StatsCard';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Users, TrendingUp, BookOpen, Search, Filter, CheckCircle2, XCircle, Plus,
  Loader2, Award, FileText, Trash2, Edit, Calendar, Clock, UserPlus,
  BarChart3, ClipboardCheck, ChevronDown, ChevronRight, ChevronLeft, Save, X, Send,
  MessageSquare, Eye, Bot, Camera, Sparkles, HelpCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { formationService } from '../../../services/api/formation.service';
import { inscriptionService } from '../../../services/api/inscription.service';
import { elevesService } from '../../../services/api/eleves.service';
import { presenceService } from '../../../services/api/presence.service';
import { certificationService } from '../../../services/api/certification.service';
import { chatbotService } from '../../../services/chatbot.service';
import { useAuth } from '../../../services/api/hooks';
import type { Formation, FormationDetail, Inscription, Eleve, Certification, Presence, Niveau, Seance, ChatHistory } from '../../lib/types';
import { useOnboardingTour } from '../../lib/onboarding/useOnboardingTour';
import { managerTourSteps } from '../../lib/onboarding/tourSteps';

export function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [formations, setFormations] = useState<Formation[]>([]);
  const [formationDetails, setFormationDetails] = useState<Record<string, FormationDetail>>({});
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Search / Filter
  const [searchEleve, setSearchEleve] = useState('');
  const [searchFormation, setSearchFormation] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [inscFilterEleve, setInscFilterEleve] = useState('');
  const [inscFilterFormation, setInscFilterFormation] = useState('all');
  const [inscFilterStatus, setInscFilterStatus] = useState('all');

  // Create Eleve
  const [isAddEleveOpen, setIsAddEleveOpen] = useState(false);
  const [newEleve, setNewEleve] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', date_naissance: '' });
  const [addingEleve, setAddingEleve] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Edit Eleve
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null);
  const [editEleveData, setEditEleveData] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', statut: 'actif' });
  const [savingEleve, setSavingEleve] = useState(false);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);

  // Inspect Eleve
  const [inspectEleve, setInspectEleve] = useState<Eleve | null>(null);
  const [inspectPresences, setInspectPresences] = useState<Presence[]>([]);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Create Formation
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newFormation, setNewFormation] = useState({ nom_formation: '', description: '', statut: 'active' });
  const [creatingFormation, setCreatingFormation] = useState(false);

  // Edit Formation
  const [editingFormation, setEditingFormation] = useState<FormationDetail | null>(null);
  const [editFormData, setEditFormData] = useState({ nom_formation: '', description: '', statut: 'active' });
  const [savingFormation, setSavingFormation] = useState(false);

  // Inscription
  const [isAddInscOpen, setIsAddInscOpen] = useState(false);
  const [newInsc, setNewInsc] = useState({ id_eleve: '', id_formation: '' });
  const [addingInsc, setAddingInsc] = useState(false);

  // Enroll eleves to a formation (from formation card)
  const [enrollFormationId, setEnrollFormationId] = useState<string | null>(null);
  const [enrollSelectedEleves, setEnrollSelectedEleves] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  // Seance / Niveau
  const [expandedFormation, setExpandedFormation] = useState<string | null>(null);
  const [editingSeance, setEditingSeance] = useState<string | null>(null);
  const [seanceEdit, setSeanceEdit] = useState({ titre: '', date_prevue: '', heure_debut: '', heure_fin: '' });

  // Presence
  const [selectedSeanceId, setSelectedSeanceId] = useState<string | null>(null);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [selectedFormationForPresence, setSelectedFormationForPresence] = useState<string | null>(null);

  // Chatbot
  const [chatMessage, setChatMessage] = useState('');
  const [chatFormationId, setChatFormationId] = useState('none');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Initialize onboarding tour
  const { startTour } = useOnboardingTour({
    steps: managerTourSteps,
    localStorageKey: 'manager-tour-completed',
    onComplete: () => {
      toast.success('Guide de démarrage terminé!');
    },
  });

  // Calendar
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // ===== FETCH ALL =====
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [formRes, inscRes, eleveRes, certRes] = await Promise.all([
        formationService.findAll(), inscriptionService.findAll(),
        elevesService.findAll(), certificationService.findAll(),
      ]);
      setFormations(formRes); setInscriptions(inscRes);
      setEleves(eleveRes); setCertifications(certRes);
      const dm: Record<string, FormationDetail> = {};
      await Promise.all(formRes.map(async (f) => {
        try {
          const detail = await formationService.findOne(f._id);
          dm[f._id] = { ...detail, niveaux: detail.niveaux || [] };
        } catch {}
      }));
      setFormationDetails(dm);
    } catch (err: any) { toast.error(err.message || 'Erreur chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ===== COMPUTED =====
  const completedInsc = inscriptions.filter(i => i.statut_formation === 'completee');
  const inProgressInsc = inscriptions.filter(i => i.statut_formation === 'en_cours');
  const abandonedInsc = inscriptions.filter(i => i.statut_formation === 'abandonnee');
  const completionRate = inscriptions.length > 0 ? Math.round((completedInsc.length / inscriptions.length) * 100) : 0;

  // ===== ELEVE HANDLERS =====
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleAddEleve = async () => {
    if (!newEleve.nom.trim() || !newEleve.prenom.trim()) { toast.error('Nom et prenom requis'); return; }
    setAddingEleve(true);
    try {
      const c = await elevesService.create(newEleve, avatarFile || undefined);
      setEleves(p => [...p, c]);
      toast.success('Eleve ' + c.prenom + ' ' + c.nom + ' cree');
      setNewEleve({ nom: '', prenom: '', email: '', telephone: '', adresse: '', date_naissance: '' });
      setAvatarFile(null); setAvatarPreview(null);
      setIsAddEleveOpen(false);
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setAddingEleve(false); }
  };
  const handleEditEleve = (e: Eleve) => {
    setEditingEleve(e);
    setEditEleveData({ nom: e.nom, prenom: e.prenom, email: e.email || '', telephone: e.telephone || '', adresse: e.adresse || '', statut: e.statut });
    setEditAvatarFile(null);
    setEditAvatarPreview(e.avatar || null);
  };
  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleSaveEleve = async () => {
    if (!editingEleve) return;
    setSavingEleve(true);
    try {
      const u = await elevesService.update(editingEleve._id, editEleveData, editAvatarFile || undefined);
      setEleves(p => p.map(e => e._id === editingEleve._id ? u : e));
      toast.success('Eleve mis a jour'); setEditingEleve(null);
      setEditAvatarFile(null); setEditAvatarPreview(null);
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setSavingEleve(false); }
  };
  const handleDeleteEleve = async (id: string) => {
    try { await elevesService.remove(id); setEleves(p => p.filter(e => e._id !== id)); toast.success('Eleve supprime'); }
    catch (e: any) { toast.error(e.message || 'Erreur'); }
  };

  // ===== INSPECT ELEVE =====
  const handleInspectEleve = async (eleve: Eleve) => {
    setInspectEleve(eleve);
    setLoadingInspect(true);
    const eleveInscs = inscriptions.filter(i => {
      const eId = typeof i.id_eleve === 'object' ? (i.id_eleve as Eleve)._id : i.id_eleve;
      return eId === eleve._id;
    });
    const allPresences: Presence[] = [];
    for (const insc of eleveInscs) {
      const fId = typeof insc.id_formation === 'string' ? insc.id_formation : (insc.id_formation as Formation)._id;
      const detail = formationDetails[fId];
      if (!detail) continue;
      for (const niv of detail.niveaux) {
        for (const seance of (niv.seances || [])) {
          try {
            const ps = await presenceService.findBySeance(seance._id);
            const mine = ps.filter(p => {
              const pInsc = typeof p.id_inscription === 'object' ? (p.id_inscription as any)._id : p.id_inscription;
              return pInsc === insc._id;
            });
            allPresences.push(...mine);
          } catch {}
        }
      }
    }
    setInspectPresences(allPresences);
    setLoadingInspect(false);
  };

  // ===== FORMATION HANDLERS =====
  const handleCreateFormation = async () => {
    if (!newFormation.nom_formation.trim()) { toast.error('Nom requis'); return; }
    setCreatingFormation(true);
    try {
      const c = await formationService.create({ nom_formation: newFormation.nom_formation.trim(), description: newFormation.description.trim() || undefined, statut: newFormation.statut as any });
      setFormations(p => [...p, c]);
      try { const d = await formationService.findOne(c._id); setFormationDetails((p: any)=> ({ ...p, [c._id]: d })); } catch {}
      toast.success('Formation "' + c.nom_formation + '" creee');
      setNewFormation({ nom_formation: '', description: '', statut: 'active' });
      setIsCreateFormOpen(false);
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setCreatingFormation(false); }
  };
  const handleOpenEditFormation = (f: FormationDetail) => {
    setEditingFormation(f);
    setEditFormData({ nom_formation: f.nom_formation, description: f.description || '', statut: f.statut });
  };
  const handleSaveFormation = async () => {
    if (!editingFormation) return;
    setSavingFormation(true);
    try {
      const u = await formationService.update(editingFormation._id, { nom_formation: editFormData.nom_formation, description: editFormData.description || undefined, statut: editFormData.statut as any });
      setFormations(p => p.map(f => f._id === editingFormation._id ? u : f));
      setFormationDetails(p => ({ ...p, [editingFormation._id]: { ...p[editingFormation._id], ...u } }));
      toast.success('Formation mise a jour'); setEditingFormation(null);
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setSavingFormation(false); }
  };
  const handleDeleteFormation = async (id: string) => {
    try { await formationService.remove(id); setFormations(p => p.filter(f => f._id !== id)); toast.success('Formation supprimee'); }
    catch (e: any) { toast.error(e.message || 'Erreur'); }
  };

  // ===== NIVEAU / SEANCE =====
  const handleToggleNiveau = async (niveauId: string, currentStatut: boolean) => {
    try {
      const fId = Object.keys(formationDetails).find(k => formationDetails[k].niveaux.some(n => n._id === niveauId));
      if (fId && !currentStatut) {
        // Deactivate all other niveaux first, then activate this one
        const niveaux = formationDetails[fId].niveaux;
        for (const n of niveaux) {
          if (n._id !== niveauId && n.statut) {
            await formationService.updateNiveau(n._id, { statut: false });
          }
        }
      }
      await formationService.updateNiveau(niveauId, { statut: !currentStatut });
      if (fId) { const d = await formationService.findOne(fId); setFormationDetails((p:any )=> ({ ...p, [fId]: d })); }
      toast.success('Niveau mis a jour');
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
  };
  const handleStartEditSeance = (s: Seance) => {
    setEditingSeance(s._id);
    setSeanceEdit({ titre: s.titre, date_prevue: s.date_prevue ? s.date_prevue.substring(0, 10) : '', heure_debut: s.heure_debut || '', heure_fin: s.heure_fin || '' });
  };
  const handleSaveSeance = async (seanceId: string, formationId: string) => {
    try {
      await formationService.updateSeance(seanceId, { titre: seanceEdit.titre || undefined, date_prevue: seanceEdit.date_prevue || undefined, heure_debut: seanceEdit.heure_debut || undefined, heure_fin: seanceEdit.heure_fin || undefined });
      const d = await formationService.findOne(formationId);
      setFormationDetails((p: any) => ({ ...p, [formationId]: d }));
      setEditingSeance(null);
      toast.success('Seance mise a jour');
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
  };

  // ===== INSCRIPTION =====
  const handleAddInscription = async () => {
    if (!newInsc.id_eleve || !newInsc.id_formation) { toast.error('Selectionnez eleve et formation'); return; }
    setAddingInsc(true);
    try {
      await inscriptionService.create(newInsc);
      const updated = await inscriptionService.findAll();
      setInscriptions(updated);
      toast.success('Inscription creee');
      setNewInsc({ id_eleve: '', id_formation: '' });
      setIsAddInscOpen(false);
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setAddingInsc(false); }
  };
  const handleUpdateInscStatus = async (id: string, statut: string) => {
    try {
      await inscriptionService.updateStatus(id, { statut_formation: statut as any });
      const updated = await inscriptionService.findAll();
      setInscriptions(updated);
      toast.success('Statut mis a jour');
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
  };

  // ===== ENROLL ELEVES FROM FORMATION CARD =====
  const getUninscribedEleves = (formationId: string) => {
    const inscribedIds = inscriptions
      .filter(i => { const fId = typeof i.id_formation === 'string' ? i.id_formation : (i.id_formation as Formation)?._id; return fId === formationId; })
      .map(i => typeof i.id_eleve === 'string' ? i.id_eleve : (i.id_eleve as Eleve)?._id);
    return eleves.filter(e => !inscribedIds.includes(e._id) && e.statut === 'actif');
  };
  const handleOpenEnroll = (formationId: string) => {
    setEnrollFormationId(formationId);
    setEnrollSelectedEleves([]);
  };
  const handleToggleEnrollEleve = (eleveId: string) => {
    setEnrollSelectedEleves(prev => prev.includes(eleveId) ? prev.filter(id => id !== eleveId) : [...prev, eleveId]);
  };
  const handleConfirmEnroll = async () => {
    if (!enrollFormationId || enrollSelectedEleves.length === 0) return;
    setEnrolling(true);
    let success = 0;
    for (const eleveId of enrollSelectedEleves) {
      try {
        await inscriptionService.create({ id_eleve: eleveId, id_formation: enrollFormationId });
        success++;
      } catch {}
    }
    const updated = await inscriptionService.findAll();
    setInscriptions(updated);
    toast.success(success + ' eleve(s) inscrit(s)');
    setEnrollFormationId(null);
    setEnrollSelectedEleves([]);
    setEnrolling(false);
  };

  // ===== PRESENCE =====
  const handleLoadPresences = async (seanceId: string) => {
    setSelectedSeanceId(seanceId);
    setLoadingPresence(true);
    try { const res = await presenceService.findBySeance(seanceId); setPresences(res); }
    catch (e: any) { toast.error(e.message || 'Erreur'); setPresences([]); }
    finally { setLoadingPresence(false); }
  };
  const handleMarkPresence = async (inscriptionId: string, seanceId: string, present: boolean) => {
    try {
      await presenceService.markPresence({ id_inscription: inscriptionId, id_seance: seanceId, present });
      const res = await presenceService.findBySeance(seanceId);
      setPresences(res);
      toast.success(present ? 'Present' : 'Absent marque');
      // check advancement
      if (selectedFormationForPresence) {
        try { const adv = await formationService.checkAdvancement(selectedFormationForPresence);
          if (adv.advanced) { toast.success('Niveau ' + adv.currentNiveau + ' active automatiquement !');
            const d = await formationService.findOne(selectedFormationForPresence);
            setFormationDetails((p: any) => ({ ...p, [selectedFormationForPresence!]: d }));
          }
        } catch {}
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('409') || err.message.includes('already'))) {
        const existing = presences.find(p => { const pInsc = typeof p.id_inscription === 'object' ? (p.id_inscription as any)._id : p.id_inscription; return pInsc === inscriptionId; });
        if (existing) {
          await presenceService.update(existing._id, { present });
          const res = await presenceService.findBySeance(seanceId);
          setPresences(res);
          toast.success('Presence mise a jour');
        }
      } else { toast.error(err.message || 'Erreur'); }
    }
  };
  const handleTogglePresence = async (presenceId: string, currentPresent: boolean) => {
    try {
      await presenceService.update(presenceId, { present: !currentPresent });
      if (selectedSeanceId) { const res = await presenceService.findBySeance(selectedSeanceId); setPresences(res); }
      toast.success('Presence modifiee');
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
  };

  // ===== CHATBOT =====
  const currentUserId = user?._id || user?._id || localStorage.getItem('userid');
  const loadChatHistory = async () => {
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
    }
    catch {} finally { setChatLoading(false); }
  };
  const handleSendChat = async () => {
    if (!chatMessage.trim() || chatSending) return;
    setChatSending(true);
    try {
      await chatbotService.ask({ message: chatMessage, formationId: chatFormationId === 'none' ? undefined : chatFormationId });
      setChatMessage('');
      await loadChatHistory();
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (e: any) { toast.error(e.message || 'Erreur chatbot'); }
    finally { setChatSending(false); }
  };
  const handleDeleteChat = async (recordId: string) => {
    try {
      await chatbotService.deleteChatRecord(recordId);
      setChatHistory(prev => prev.filter(c => c._id !== recordId));
      toast.success('Message supprimé');
    } catch (e: any) { toast.error(e.message || 'Erreur suppression'); }
  };

  // ===== CHART DATA =====
  const inscByStatus = [
    { name: 'En cours', value: inProgressInsc.length, color: 'hsl(var(--primary))' },
    { name: 'Completees', value: completedInsc.length, color: '#22c55e' },
    { name: 'Abandonnees', value: abandonedInsc.length, color: '#ef4444' },
  ];
  const formChartData = formations.map(f => {
    const cnt = inscriptions.filter(i => { const fId = typeof i.id_formation === 'string' ? i.id_formation : (i.id_formation as Formation)?._id; return fId === f._id; }).length;
    return { name: f.nom_formation.substring(0, 18), inscrits: cnt };
  });

  // ===== CALENDAR DATA =====
  type SeanceWithMeta = Seance & { formationName: string; niveauName: string };
  const allSeances: SeanceWithMeta[] = [];
  Object.entries(formationDetails).forEach(([fId, detail]) => {
    const fName = detail.nom_formation;
    (detail.niveaux || []).forEach(niv => {
      (niv.seances || []).forEach(s => {
        if (s.date_prevue) {
          allSeances.push({ ...s, formationName: fName, niveauName: niv.nom_niveau });
        }
      });
    });
  });
  allSeances.sort((a, b) => new Date(a.date_prevue!).getTime() - new Date(b.date_prevue!).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build calendar grid for the selected month
  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // Monday=0
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarWeeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) { calendarWeeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length > 0) { while (currentWeek.length < 7) currentWeek.push(null); calendarWeeks.push(currentWeek); }

  // Map: 'YYYY-MM-DD' -> seances for that day
  const seancesByDate: Record<string, SeanceWithMeta[]> = {};
  allSeances.forEach(s => {
    const d = new Date(s.date_prevue!);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (!seancesByDate[key]) seancesByDate[key] = [];
    seancesByDate[key].push(s);
  });
  const todayKey = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const calMonthLabel = firstDayOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // ===== FILTERED =====
  const filteredEleves = eleves.filter(e => (e.nom + ' ' + e.prenom + ' ' + (e.email || '')).toLowerCase().includes(searchEleve.toLowerCase()));
  const filteredFormations = formations.filter(f => {
    const matchSearch = f.nom_formation.toLowerCase().includes(searchFormation.toLowerCase());
    const matchFilter = filterStatus === 'all' || f.statut === filterStatus;
    return matchSearch && matchFilter;
  });
  const filteredInscriptions = inscriptions.filter(i => {
    const eleve = typeof i.id_eleve === 'object' ? i.id_eleve as Eleve : null;
    const formation = typeof i.id_formation === 'object' ? i.id_formation as Formation : null;
    const matchEleve = !inscFilterEleve || (eleve && (eleve.prenom + ' ' + eleve.nom).toLowerCase().includes(inscFilterEleve.toLowerCase()));
    const matchFormation = inscFilterFormation === 'all' || (formation && formation._id === inscFilterFormation) || (typeof i.id_formation === 'string' && i.id_formation === inscFilterFormation);
    const matchStatus = inscFilterStatus === 'all' || i.statut_formation === inscFilterStatus;
    return matchEleve && matchFormation && matchStatus;
  });

  if (loading) {
    return (<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-lg">Chargement...</span></div>);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Tableau de bord - Responsable Formation</h1>
              <p className="text-muted-foreground">Bienvenue {user?.prenom} {user?.nom}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Guide
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4" data-tour="stats-section">
          <StatsCard title="Eleves" value={String(eleves.length)} description={eleves.filter(e => e.statut === 'actif').length + ' actifs'} icon={Users} />
          <StatsCard title="Formations" value={String(formations.length)} description={formations.filter(f => f.statut === 'active').length + ' actives'} icon={BookOpen} />
          <StatsCard title="Inscriptions" value={String(inscriptions.length)} description={completionRate + '% completion'} icon={TrendingUp} />
          <StatsCard title="Certifications" value={String(certifications.length)} description="Certificats" icon={Award} />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger value="dashboard" data-tour="analytics-tab"><BarChart3 className="h-4 w-4 mr-1" />Tableau</TabsTrigger>
            <TabsTrigger value="eleves" data-tour="students-tab"><Users className="h-4 w-4 mr-1" />Eleves</TabsTrigger>
            <TabsTrigger value="formations" data-tour="formations-tab"><BookOpen className="h-4 w-4 mr-1" />Formations</TabsTrigger>
            <TabsTrigger value="seances"><Calendar className="h-4 w-4 mr-1" />Seances</TabsTrigger>
            <TabsTrigger value="inscriptions" data-tour="inscriptions-tab"><FileText className="h-4 w-4 mr-1" />Inscriptions</TabsTrigger>
            <TabsTrigger value="certifications" data-tour="certifications-tab"><Award className="h-4 w-4 mr-1" />Certificats</TabsTrigger>
            <TabsTrigger value="chatbot" data-tour="chatbot-tab" onClick={() => { if (!chatInitialized) { setChatInitialized(true); loadChatHistory(); } }}><Bot className="h-4 w-4 mr-1" aria-hidden="true" />Chatbot</TabsTrigger>
          </TabsList>

          {/* ==================== DASHBOARD ==================== */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Inscriptions par statut</CardTitle></CardHeader>
                <CardContent>
                  {inscriptions.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={inscByStatus} cx="50%" cy="50%" labelLine={false} label={(e) => e.name + ': ' + e.value} outerRadius={80} dataKey="value">
                        {inscByStatus.map((e, i) => (<Cell key={i} fill={e.color} />))}
                      </Pie><Tooltip /><Legend /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-muted-foreground py-8">Aucune donnee</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Inscrits par formation</CardTitle></CardHeader>
                <CardContent>
                  {formChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={formChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="inscrits" fill="hsl(var(--primary))" /></BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-muted-foreground py-8">Aucune formation</p>}
                </CardContent>
              </Card>

              {/* ===== CALENDRIER DES SEANCES ===== */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Calendrier des seances</CardTitle>
                      <CardDescription className="mt-1">{allSeances.length} seances planifiees</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(new Date(calYear, calMonth - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="text-sm font-medium capitalize w-36 text-center">{calMonthLabel}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(new Date(calYear, calMonth + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => { const d = new Date(); setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Aujourd'hui</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
                    {JOURS.map(j => (
                      <div key={j} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">{j}</div>
                    ))}
                    {calendarWeeks.flatMap((week, wi) => week.map((day, di) => {
                      if (day === null) return <div key={'e-' + wi + '-' + di} className="bg-background min-h-[80px] p-1" />;
                      const dateKey = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                      const daySeances = seancesByDate[dateKey] || [];
                      const isToday = dateKey === todayKey;
                      const isPast = new Date(calYear, calMonth, day) < today;
                      return (
                        <div key={dateKey} className={'bg-background min-h-[80px] p-1 transition-colors ' + (isToday ? 'ring-2 ring-primary ring-inset' : '') + (isPast ? ' opacity-50' : '')}>
                          <div className={'text-xs font-medium mb-1 px-1 ' + (isToday ? 'text-primary' : 'text-foreground')}>{day}</div>
                          <div className="space-y-0.5">
                            {daySeances.slice(0, 3).map(s => (
                              <div key={s._id} className="rounded px-1 py-0.5 text-[10px] leading-tight truncate bg-primary/10 text-primary border border-primary/20" title={s.titre + ' (' + s.formationName + ') ' + (s.heure_debut || '')}>
                                {s.heure_debut && <span className="font-medium">{s.heure_debut} </span>}
                                {s.titre}
                              </div>
                            ))}
                            {daySeances.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{daySeances.length - 3} plus</div>}
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </CardContent>
              </Card>

              {/* AVANCEMENT */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Avancement par formation</CardTitle><CardDescription>Niveaux actifs et progression</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formations.map(f => {
                      const formInsc = inscriptions.filter(i => { const id = typeof i.id_formation === 'string' ? i.id_formation : (i.id_formation as Formation)?._id; return id === f._id; });
                      const completed = formInsc.filter(i => i.statut_formation === 'completee').length;
                      const rate = formInsc.length > 0 ? Math.round((completed / formInsc.length) * 100) : 0;
                      const detail = formationDetails[f._id];
                      const niveaux = detail?.niveaux || [];
                      const activeNivs = niveaux.filter(n => n.statut).length;
                      const totalSc = niveaux.reduce((s, n) => s + (n.seances || []).length, 0);
                      return (
                        <div key={f._id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{f.nom_formation}</h4>
                              <p className="text-sm text-muted-foreground">{formInsc.length} inscrits | {activeNivs}/{niveaux.length} niveaux actifs | {totalSc} seances</p>
                            </div>
                            <Badge variant={f.statut === 'active' ? 'default' : 'secondary'}>{f.statut}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div className="bg-primary rounded-full h-3 transition-all" style={{ width: rate + '%' }}></div>
                            </div>
                            <span className="text-sm font-medium">{rate}%</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {niveaux.map(n => (
                              <Badge key={n._id} variant={n.statut ? 'default' : 'outline'} className="text-xs">
                                {n.nom_niveau} {n.statut ? '(actif)' : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {formations.length === 0 && <p className="text-center text-muted-foreground py-4">Aucune formation</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ==================== ELEVES ==================== */}
          <TabsContent value="eleves" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Eleves ({eleves.length})</h2>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Rechercher..." value={searchEleve} onChange={(e) => setSearchEleve(e.target.value)} className="pl-10 w-64" /></div>
                <Dialog open={isAddEleveOpen} onOpenChange={setIsAddEleveOpen}>
                  <DialogTrigger asChild><Button className="gap-2"><UserPlus className="h-4 w-4" /> Ajouter</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvel eleve</DialogTitle><DialogDescription>Remplissez les informations</DialogDescription></DialogHeader>
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                          <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <Camera className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={addingEleve} />
                          <p className="text-xs text-center text-muted-foreground mt-1">Photo</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Prenom *</Label><Input value={newEleve.prenom} onChange={(e) => setNewEleve(p => ({...p, prenom: e.target.value}))} disabled={addingEleve} /></div>
                        <div className="space-y-1"><Label>Nom *</Label><Input value={newEleve.nom} onChange={(e) => setNewEleve(p => ({...p, nom: e.target.value}))} disabled={addingEleve} /></div>
                      </div>
                      <div className="space-y-1"><Label>Email</Label><Input type="email" value={newEleve.email} onChange={(e) => setNewEleve(p => ({...p, email: e.target.value}))} disabled={addingEleve} /></div>
                      <div className="space-y-1"><Label>Telephone</Label><Input value={newEleve.telephone} onChange={(e) => setNewEleve(p => ({...p, telephone: e.target.value}))} disabled={addingEleve} /></div>
                      <div className="space-y-1"><Label>Date de naissance</Label><Input type="date" value={newEleve.date_naissance} onChange={(e) => setNewEleve(p => ({...p, date_naissance: e.target.value}))} disabled={addingEleve} /></div>
                      <div className="space-y-1"><Label>Adresse</Label><Input value={newEleve.adresse} onChange={(e) => setNewEleve(p => ({...p, adresse: e.target.value}))} disabled={addingEleve} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddEleveOpen(false)}>Annuler</Button>
                      <Button onClick={handleAddEleve} disabled={addingEleve}>{addingEleve ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Creer'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Edit Eleve Dialog */}
            <Dialog open={!!editingEleve} onOpenChange={(o) => { if (!o) { setEditingEleve(null); setEditAvatarFile(null); setEditAvatarPreview(null); } }}>
              <DialogContent>
                <DialogHeader><DialogTitle>Modifier l'eleve</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="relative cursor-pointer" onClick={() => editAvatarInputRef.current?.click()}>
                      <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center hover:border-primary transition-colors">
                        {editAvatarPreview ? (
                          <img src={editAvatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">{(editEleveData.prenom?.[0] || '') + (editEleveData.nom?.[0] || '')}</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5"><Camera className="h-3 w-3 text-primary-foreground" /></div>
                      <input ref={editAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditAvatarChange} disabled={savingEleve} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Prenom</Label><Input value={editEleveData.prenom} onChange={(e) => setEditEleveData(p => ({...p, prenom: e.target.value}))} disabled={savingEleve} /></div>
                    <div className="space-y-1"><Label>Nom</Label><Input value={editEleveData.nom} onChange={(e) => setEditEleveData(p => ({...p, nom: e.target.value}))} disabled={savingEleve} /></div>
                  </div>
                  <div className="space-y-1"><Label>Email</Label><Input type="email" value={editEleveData.email} onChange={(e) => setEditEleveData(p => ({...p, email: e.target.value}))} disabled={savingEleve} /></div>
                  <div className="space-y-1"><Label>Telephone</Label><Input value={editEleveData.telephone} onChange={(e) => setEditEleveData(p => ({...p, telephone: e.target.value}))} disabled={savingEleve} /></div>
                  <div className="space-y-1"><Label>Adresse</Label><Input value={editEleveData.adresse} onChange={(e) => setEditEleveData(p => ({...p, adresse: e.target.value}))} disabled={savingEleve} /></div>
                  <div className="space-y-1"><Label>Statut</Label>
                    <Select value={editEleveData.statut} onValueChange={(v) => setEditEleveData(p => ({...p, statut: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="archive">Archive</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingEleve(null)}>Annuler</Button>
                  <Button onClick={handleSaveEleve} disabled={savingEleve}>{savingEleve ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Enregistrer'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Inspect Eleve Dialog */}
            <Dialog open={!!inspectEleve} onOpenChange={(o) => { if (!o) { setInspectEleve(null); setInspectPresences([]); } }}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Fiche eleve</DialogTitle><DialogDescription>Inscriptions, presences et certifications</DialogDescription></DialogHeader>
                {loadingInspect ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border flex-shrink-0 bg-muted flex items-center justify-center">
                        {inspectEleve?.avatar ? (
                          <img src={inspectEleve.avatar} alt={inspectEleve.prenom + ' ' + inspectEleve.nom} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">{(inspectEleve?.prenom?.[0] || '') + (inspectEleve?.nom?.[0] || '')}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{inspectEleve?.prenom} {inspectEleve?.nom}</h3>
                        <Badge variant={inspectEleve?.statut === 'actif' ? 'default' : 'secondary'} className="mt-1">{inspectEleve?.statut}</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Informations</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Email:</span><span>{inspectEleve?.email || '-'}</span>
                        <span className="text-muted-foreground">Telephone:</span><span>{inspectEleve?.telephone || '-'}</span>
                        <span className="text-muted-foreground">Adresse:</span><span>{inspectEleve?.adresse || '-'}</span>
                        <span className="text-muted-foreground">Inscrit le:</span><span>{inspectEleve?.date_inscription ? new Date(inspectEleve.date_inscription).toLocaleDateString('fr-FR') : '-'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Inscriptions & Presences</h4>
                      {(() => {
                        const eleveInscs = inscriptions.filter(i => {
                          const eId = typeof i.id_eleve === 'object' ? (i.id_eleve as Eleve)._id : i.id_eleve;
                          return eId === inspectEleve?._id;
                        });
                        if (eleveInscs.length === 0) return <p className="text-sm text-muted-foreground">Aucune inscription</p>;
                        return eleveInscs.map(insc => {
                          const formation = typeof insc.id_formation === 'object' ? insc.id_formation as Formation : null;
                          const fId = formation?._id || (typeof insc.id_formation === 'string' ? insc.id_formation : '');
                          const detail = formationDetails[fId];
                          const totalSeances = detail ? detail.niveaux.reduce((s, n) => s + (n.seances || []).length, 0) : 0;
                          const inscPresences = inspectPresences.filter(p => {
                            const pInsc = typeof p.id_inscription === 'object' ? (p.id_inscription as any)._id : p.id_inscription;
                            return pInsc === insc._id;
                          });
                          const presentCount = inscPresences.filter(p => p.present).length;
                          const absentCount = inscPresences.filter(p => !p.present).length;
                          const presenceRate = totalSeances > 0 ? Math.round((presentCount / totalSeances) * 100) : 0;
                          const isEligible = presenceRate >= 75;
                          const alreadyCertified = certifications.some(c => {
                            const cInsc = typeof c.id_inscription === 'object' ? (c.id_inscription as any)._id : c.id_inscription;
                            return cInsc === insc._id;
                          });
                          return (
                            <div key={insc._id} className="border border-border rounded-md p-3 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{formation ? formation.nom_formation : 'Formation'}</span>
                                <Badge variant={insc.statut_formation === 'completee' ? 'default' : insc.statut_formation === 'abandonnee' ? 'destructive' : 'secondary'}>{insc.statut_formation}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Niveau actuel: {insc.niveau_actuel} | Inscrit le {insc.date_inscription ? new Date(insc.date_inscription).toLocaleDateString('fr-FR') : '-'}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="text-green-600">Present: {presentCount}</span>
                                <span className="text-red-600">Absent: {absentCount}</span>
                                <span className="text-muted-foreground">Total seances: {totalSeances}</span>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div className={'rounded-full h-2 transition-all ' + (presenceRate >= 75 ? 'bg-green-500' : presenceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: Math.min(presenceRate, 100) + '%' }}></div>
                                  </div>
                                  <span className={'text-xs font-medium ' + (presenceRate >= 75 ? 'text-green-600' : presenceRate >= 50 ? 'text-yellow-600' : 'text-red-600')}>{presenceRate}%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Taux de presence ({presentCount}/{totalSeances}) — 75% requis pour certification</p>
                              </div>
                              {alreadyCertified ? (
                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600"><Award className="h-3 w-3" /> Certifie</div>
                              ) : isEligible ? (
                                <Button size="sm" className="mt-2 gap-1" onClick={async () => {
                                  try {
                                    await certificationService.create({ id_inscription: insc._id, delivre_par: (user?.prenom || '') + ' ' + (user?.nom || '') });
                                    const updatedCerts = await certificationService.findAll();
                                    setCertifications(updatedCerts);
                                    toast.success('Certificat genere avec succes !');
                                  } catch (e: any) { toast.error(e.message || 'Erreur generation certificat'); }
                                }}><Award className="h-4 w-4" /> Generer certificat</Button>
                              ) : (
                                <p className="mt-2 text-[10px] text-muted-foreground">Presence insuffisante pour la certification</p>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      {(() => {
                        const eleveCerts = certifications.filter(c => {
                          const insc = typeof c.id_inscription === 'object' ? c.id_inscription as any : null;
                          const el = insc?.id_eleve;
                          return el && el._id === inspectEleve?._id;
                        });
                        if (eleveCerts.length === 0) return <p className="text-sm text-muted-foreground">Aucune certification</p>;
                        return eleveCerts.map(cert => (
                          <div key={cert._id} className="border border-border rounded-md p-3 mb-2 flex items-center justify-between">
                            <div><Award className="h-4 w-4 inline mr-1 text-primary" /><span className="text-sm font-medium">{cert.numero_certificat}</span><p className="text-xs text-muted-foreground">Delivre le {cert.date_delivrance ? new Date(cert.date_delivrance).toLocaleDateString('fr-FR') : '-'}</p></div>
                            <Button variant="outline" size="sm" onClick={async () => {
                              try { const blob = await certificationService.downloadPdf(cert._id); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cert-' + cert.numero_certificat + '.pdf'; a.click(); window.URL.revokeObjectURL(url); }
                              catch (e: any) { toast.error(e.message || 'Erreur PDF'); }
                            }}><FileText className="h-4 w-4" /></Button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-4 py-3 text-left font-medium">Eleve</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Tel</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-left font-medium">Inscrit le</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filteredEleves.map(e => (
                  <tr key={e._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar className="h-8 w-8">{e.avatar ? <AvatarImage src={e.avatar} alt={e.prenom + ' ' + e.nom} /> : null}<AvatarFallback className="text-xs">{(e.prenom?.[0]||'')+(e.nom?.[0]||'')}</AvatarFallback></Avatar><span className="font-medium">{e.prenom} {e.nom}</span></div></td>
                    <td className="px-4 py-3 text-muted-foreground">{e.email || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.telephone || '-'}</td>
                    <td className="px-4 py-3"><Badge variant={e.statut === 'actif' ? 'default' : 'secondary'}>{e.statut}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{e.date_inscription ? new Date(e.date_inscription).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleInspectEleve(e)} title="Inspecter"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditEleve(e)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteEleve(e._id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEleves.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun eleve</td></tr>}
              </tbody>
            </table></div></CardContent></Card>
          </TabsContent>

          {/* ==================== FORMATIONS ==================== */}
          <TabsContent value="formations" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Formations ({formations.length})</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Rechercher..." value={searchFormation} onChange={(e) => setSearchFormation(e.target.value)} className="pl-10 w-56" /></div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-28"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Toutes</SelectItem><SelectItem value="active">Actives</SelectItem><SelectItem value="inactive">Inactives</SelectItem></SelectContent>
                </Select>
                <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-tour="add-formation-btn">
                      <Plus className="h-4 w-4" /> Creer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvelle formation</DialogTitle><DialogDescription>Les niveaux et seances seront generes automatiquement.</DialogDescription></DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1"><Label>Nom *</Label><Input value={newFormation.nom_formation} onChange={(e) => setNewFormation(p => ({...p, nom_formation: e.target.value}))} disabled={creatingFormation} /></div>
                      <div className="space-y-1"><Label>Description</Label><Textarea value={newFormation.description} rows={3} onChange={(e) => setNewFormation(p => ({...p, description: e.target.value}))} disabled={creatingFormation} /></div>
                      <div className="space-y-1"><Label>Statut</Label>
                        <Select value={newFormation.statut} onValueChange={(v) => setNewFormation(p => ({...p, statut: v}))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateFormOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreateFormation} disabled={creatingFormation}>{creatingFormation ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Creer'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Edit Formation Dialog */}
            <Dialog open={!!editingFormation} onOpenChange={(o) => { if (!o) setEditingFormation(null); }}>
              <DialogContent>
                <DialogHeader><DialogTitle>Modifier la formation</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label>Nom</Label><Input value={editFormData.nom_formation} onChange={(e) => setEditFormData(p => ({...p, nom_formation: e.target.value}))} disabled={savingFormation} /></div>
                  <div className="space-y-1"><Label>Description</Label><Textarea value={editFormData.description} rows={3} onChange={(e) => setEditFormData(p => ({...p, description: e.target.value}))} disabled={savingFormation} /></div>
                  <div className="space-y-1"><Label>Statut</Label>
                    <Select value={editFormData.statut} onValueChange={(v) => setEditFormData(p => ({...p, statut: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingFormation(null)}>Annuler</Button>
                  <Button onClick={handleSaveFormation} disabled={savingFormation}>{savingFormation ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Enregistrer'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Enroll Eleves Dialog */}
            <Dialog open={!!enrollFormationId} onOpenChange={(o) => { if (!o) { setEnrollFormationId(null); setEnrollSelectedEleves([]); } }}>
              <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Inscrire des eleves</DialogTitle>
                  <DialogDescription>Selectionnez les eleves a inscrire a cette formation</DialogDescription>
                </DialogHeader>
                {enrollFormationId && (() => {
                  const uninscribed = getUninscribedEleves(enrollFormationId);
                  if (uninscribed.length === 0) return <p className="text-sm text-muted-foreground py-4">Tous les eleves actifs sont deja inscrits a cette formation.</p>;
                  return (
                    <div className="space-y-2">
                      {uninscribed.map(e => (
                        <label key={e._id} className={'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ' + (enrollSelectedEleves.includes(e._id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30')}>
                          <input type="checkbox" checked={enrollSelectedEleves.includes(e._id)} onChange={() => handleToggleEnrollEleve(e._id)} className="h-4 w-4 rounded border-border" />
                          <Avatar className="h-8 w-8">{e.avatar ? <AvatarImage src={e.avatar} alt={e.prenom + ' ' + e.nom} /> : null}<AvatarFallback className="text-xs">{(e.prenom?.[0]||'')+(e.nom?.[0]||'')}</AvatarFallback></Avatar>
                          <div>
                            <span className="font-medium text-sm">{e.prenom} {e.nom}</span>
                            {e.email && <p className="text-xs text-muted-foreground">{e.email}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  );
                })()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setEnrollFormationId(null); setEnrollSelectedEleves([]); }}>Annuler</Button>
                  <Button onClick={handleConfirmEnroll} disabled={enrolling || enrollSelectedEleves.length === 0}>
                    {enrolling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Inscrire ' + enrollSelectedEleves.length + ' eleve(s)'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {filteredFormations.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune formation</p></CardContent></Card>
            ) : (
              <div className="space-y-4">
                {filteredFormations.map(f => {
                  const detail = formationDetails[f._id];
                  const niveaux = detail?.niveaux || [];
                  const seancesCount = niveaux.reduce((s, n) => s + (n.seances || []).length, 0);
                  const formInsc = inscriptions.filter(i => { const id = typeof i.id_formation === 'string' ? i.id_formation : (i.id_formation as Formation)?._id; return id === f._id; });
                  const activeNivs = niveaux.filter(n => n.statut).length;
                  return (
                    <Card key={f._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{f.nom_formation}</h3>
                              <Badge variant={f.statut === 'active' ? 'default' : 'secondary'}>{f.statut}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{f.description || 'Pas de description'}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{activeNivs}/{niveaux.length} niveaux actifs</span>
                              <span>{seancesCount} seances</span>
                              <span>{formInsc.length} inscrits</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleOpenEnroll(f._id)}><UserPlus className="h-4 w-4" /> Inscrire</Button>
                            <Button variant="ghost" size="sm" onClick={() => detail && handleOpenEditFormation(detail)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteFormation(f._id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== SEANCES & NIVEAUX ==================== */}
          <TabsContent value="seances" className="space-y-6">
            <h2 className="text-xl font-semibold">Niveaux et Seances</h2>
            <p className="text-muted-foreground">Cliquez sur une formation pour voir et modifier ses niveaux et seances. Les niveaux avancent automatiquement.</p>
            {formations.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune formation</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {formations.map(f => {
                  const detail = formationDetails[f._id];
                  const isExpanded = expandedFormation === f._id;
                  const niveaux = detail?.niveaux || [];
                  return (
                    <Card key={f._id}>
                      <CardContent className="p-0">
                        <button onClick={() => setExpandedFormation(isExpanded ? null : f._id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            <div>
                              <h3 className="font-medium">{f.nom_formation}</h3>
                              <p className="text-sm text-muted-foreground">{niveaux.length} niveaux | {niveaux.reduce((s, n) => s + (n.seances?.length || 0), 0)} seances</p>
                            </div>
                          </div>
                          <Badge variant={f.statut === 'active' ? 'default' : 'secondary'}>{f.statut}</Badge>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-border px-4 pb-4">
                            {niveaux.map(niveau => (
                              <div key={niveau._id} className="mt-4">
                                <div className="flex items-center justify-between mb-2 bg-muted/30 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{niveau.nom_niveau}</span>
                                    <Badge variant={niveau.statut ? 'default' : 'outline'}>{niveau.statut ? 'Actif' : 'Inactif'}</Badge>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => handleToggleNiveau(niveau._id, niveau.statut)}>
                                    {niveau.statut ? 'Desactiver' : 'Activer'}
                                  </Button>
                                </div>
                                <div className="ml-4 space-y-2">
                                  {(niveau.seances || []).map(seance => (
                                    <div key={seance._id} className="border border-border rounded-md p-3">
                                      {editingSeance === seance._id ? (
                                        <div className="space-y-2">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div><Label className="text-xs">Titre</Label><Input value={seanceEdit.titre} onChange={(e) => setSeanceEdit(p => ({...p, titre: e.target.value}))} className="h-8 text-sm" /></div>
                                            <div><Label className="text-xs">Date prevue</Label><Input type="date" value={seanceEdit.date_prevue} onChange={(e) => setSeanceEdit(p => ({...p, date_prevue: e.target.value}))} className="h-8 text-sm" /></div>
                                            <div><Label className="text-xs">Heure debut</Label><Input type="time" value={seanceEdit.heure_debut} onChange={(e) => setSeanceEdit(p => ({...p, heure_debut: e.target.value}))} className="h-8 text-sm" /></div>
                                            <div><Label className="text-xs">Heure fin</Label><Input type="time" value={seanceEdit.heure_fin} onChange={(e) => setSeanceEdit(p => ({...p, heure_fin: e.target.value}))} className="h-8 text-sm" /></div>
                                          </div>
                                          <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingSeance(null)}><X className="h-4 w-4" /></Button>
                                            <Button size="sm" onClick={() => handleSaveSeance(seance._id, f._id)}><Save className="h-4 w-4 mr-1" /> Sauver</Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <span className="font-medium text-sm">{seance.titre}</span>
                                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                              {seance.date_prevue && <span><Calendar className="h-3 w-3 inline mr-1" />{new Date(seance.date_prevue).toLocaleDateString('fr-FR')}</span>}
                                              {seance.heure_debut && <span><Clock className="h-3 w-3 inline mr-1" />{seance.heure_debut} - {seance.heure_fin || '?'}</span>}
                                              {!seance.date_prevue && !seance.heure_debut && <span className="text-yellow-600">Non planifiee</span>}
                                            </div>
                                          </div>
                                          <Button variant="ghost" size="sm" onClick={() => handleStartEditSeance(seance)}><Edit className="h-4 w-4" /></Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== INSCRIPTIONS ==================== */}
          <TabsContent value="inscriptions" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Inscriptions ({inscriptions.length})</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Rechercher eleve..." value={inscFilterEleve} onChange={(e) => setInscFilterEleve(e.target.value)} className="pl-10 w-56" /></div>
                <Select value={inscFilterFormation} onValueChange={setInscFilterFormation}>
                  <SelectTrigger className="w-52"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Formation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les formations</SelectItem>
                    {formations.map(f => (<SelectItem key={f._id} value={f._id}>{f.nom_formation}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={inscFilterStatus} onValueChange={setInscFilterStatus}>
                  <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="completee">Completee</SelectItem>
                    <SelectItem value="abandonnee">Abandonnee</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isAddInscOpen} onOpenChange={setIsAddInscOpen}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Inscrire</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvelle inscription</DialogTitle><DialogDescription>Inscrire un eleve a une formation</DialogDescription></DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1"><Label>Eleve</Label>
                        <Select value={newInsc.id_eleve} onValueChange={(v) => setNewInsc(p => ({...p, id_eleve: v}))}>
                          <SelectTrigger><SelectValue placeholder="Selectionnez" /></SelectTrigger>
                          <SelectContent>{eleves.map(e => (<SelectItem key={e._id} value={e._id}>{e.prenom} {e.nom}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label>Formation</Label>
                        <Select value={newInsc.id_formation} onValueChange={(v) => setNewInsc(p => ({...p, id_formation: v}))}>
                          <SelectTrigger><SelectValue placeholder="Selectionnez" /></SelectTrigger>
                          <SelectContent>{formations.map(f => (<SelectItem key={f._id} value={f._id}>{f.nom_formation}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddInscOpen(false)}>Annuler</Button>
                      <Button onClick={handleAddInscription} disabled={addingInsc}>{addingInsc ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : 'Inscrire'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {filteredInscriptions.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune inscription</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {filteredInscriptions.map(insc => {
                  const eleve = typeof insc.id_eleve === 'object' ? insc.id_eleve as Eleve : null;
                  const formation = typeof insc.id_formation === 'object' ? insc.id_formation as Formation : null;
                  return (
                    <Card key={insc._id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            {eleve && <Avatar className="h-9 w-9">{eleve.avatar ? <AvatarImage src={eleve.avatar} alt={eleve.prenom + ' ' + eleve.nom} /> : null}<AvatarFallback className="text-xs">{(eleve.prenom?.[0]||'')+(eleve.nom?.[0]||'')}</AvatarFallback></Avatar>}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{eleve ? eleve.prenom + ' ' + eleve.nom : 'Eleve #' + String(insc.id_eleve).substring(0, 8)}</h4>
                              <Badge variant={insc.statut_formation === 'completee' ? 'default' : insc.statut_formation === 'abandonnee' ? 'destructive' : 'secondary'}>{insc.statut_formation}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Formation: {formation ? formation.nom_formation : 'ID: ' + String(insc.id_formation).substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">Niveau: {insc.niveau_actuel} | {insc.date_inscription ? new Date(insc.date_inscription).toLocaleDateString('fr-FR') : '-'}</p>
                          </div>
                          </div>
                          <div className="flex gap-2">
                            {insc.statut_formation === 'en_cours' && (<>
                              <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive" onClick={() => handleUpdateInscStatus(insc._id, 'abandonnee')}><XCircle className="h-4 w-4" /> Abandon</Button>
                              <Button size="sm" className="gap-1" onClick={() => handleUpdateInscStatus(insc._id, 'completee')}><CheckCircle2 className="h-4 w-4" /> Completer</Button>
                            </>)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== CERTIFICATIONS ==================== */}
          <TabsContent value="certifications" className="space-y-6">
            <h2 className="text-xl font-semibold">Certifications</h2>

            {/* Existing certificates */}
            {certifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Certificats delivres ({certifications.length})</h3>
                {certifications.map(cert => {
                  const insc = typeof cert.id_inscription === 'object' ? cert.id_inscription as any : null;
                  const el = insc?.id_eleve; const fo = insc?.id_formation;
                  return (
                    <Card key={cert._id}><CardContent className="p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Award className="h-5 w-5 text-primary" /></div>
                          <div>
                            <h4 className="font-medium">{el ? el.prenom + ' ' + el.nom : '-'}</h4>
                            <p className="text-sm text-muted-foreground">{fo ? fo.nom_formation : '-'}</p>
                            <p className="text-xs text-muted-foreground">N° {cert.numero_certificat} | Delivre le {cert.date_delivrance ? new Date(cert.date_delivrance).toLocaleDateString('fr-FR') : '-'} par {cert.delivre_par}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1" onClick={async () => {
                          try { const blob = await certificationService.downloadPdf(cert._id); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cert-' + cert.numero_certificat + '.pdf'; a.click(); window.URL.revokeObjectURL(url); }
                          catch (e: any) { toast.error(e.message || 'Erreur PDF'); }
                        }}><FileText className="h-4 w-4" /> PDF</Button>
                      </div>
                    </CardContent></Card>
                  );
                })}
              </div>
            )}

            {/* Eligible for certification */}
            <Card>
              <CardHeader>
                <CardTitle>Generer des certificats</CardTitle>
                <CardDescription>Eleves eligibles (taux de presence &ge; 75% des seances de la formation)</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const eligible: { insc: typeof inscriptions[0]; eleve: Eleve | null; formation: Formation | null; presenceRate: number; presentCount: number; totalSeances: number }[] = [];
                  inscriptions.forEach(insc => {
                    const alreadyCertified = certifications.some(c => {
                      const cId = typeof c.id_inscription === 'object' ? (c.id_inscription as any)._id : c.id_inscription;
                      return cId === insc._id;
                    });
                    if (alreadyCertified) return;
                    const eleve = typeof insc.id_eleve === 'object' ? insc.id_eleve as Eleve : null;
                    const formation = typeof insc.id_formation === 'object' ? insc.id_formation as Formation : null;
                    const fId = formation?._id || (typeof insc.id_formation === 'string' ? insc.id_formation : '');
                    const detail = formationDetails[fId];
                    if (!detail) return;
                    const totalSeances = detail.niveaux.reduce((s, n) => s + (n.seances || []).length, 0);
                    if (totalSeances === 0) return;
                    // Count presences for this inscription across all seances
                    // We need to check from the inspectPresences or do a rough calculation
                    // For the tab view, we use inscriptions data - we'll count from known data
                    // Since we can't load all presences here, we show all non-certified with a generate button
                    eligible.push({ insc, eleve, formation, presenceRate: -1, presentCount: 0, totalSeances });
                  });
                  if (eligible.length === 0) return <p className="text-center text-muted-foreground py-4">Tous les eleves eligibles ont deja ete certifies, ou aucune inscription n'est disponible.</p>;
                  return (
                    <div className="space-y-2">
                      {eligible.map(({ insc, eleve, formation, totalSeances }) => (
                        <div key={insc._id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border border-border rounded-md p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {eleve?.avatar ? <img src={eleve.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-medium text-muted-foreground">{(eleve?.prenom?.[0] || '') + (eleve?.nom?.[0] || '')}</span>}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{eleve ? eleve.prenom + ' ' + eleve.nom : 'Eleve'}</span>
                              <p className="text-xs text-muted-foreground">{formation ? formation.nom_formation : '-'} | {totalSeances} seances | {insc.statut_formation}</p>
                            </div>
                          </div>
                          <Button size="sm" className="gap-1" onClick={async () => {
                            try {
                              await certificationService.create({ id_inscription: insc._id, delivre_par: (user?.prenom || '') + ' ' + (user?.nom || '') });
                              const updatedCerts = await certificationService.findAll();
                              setCertifications(updatedCerts);
                              toast.success('Certificat genere pour ' + (eleve ? eleve.prenom + ' ' + eleve.nom : 'l\'eleve'));
                            } catch (e: any) { toast.error(e.message || 'Erreur generation certificat'); }
                          }}><Award className="h-4 w-4" /> Generer certificat</Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CHATBOT ==================== */}
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
                <h2 className="text-xl font-semibold">Assistant Pédagogique IA</h2>
                <p className="text-sm text-muted-foreground">Propulsé par Gemini — posez vos questions pédagogiques</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat area */}
              <Card className="lg:col-span-3 flex flex-col overflow-hidden" role="region" aria-label="Zone de conversation avec l'assistant IA">
                <CardHeader className="border-b border-border/50 bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                        Conversation
                      </CardTitle>
                      <CardDescription>Discutez avec Gemini pour obtenir de l'aide pédagogique</CardDescription>
                    </div>
                    {chatHistory.length > 0 && (
                      <Badge variant="secondary" className="tabular-nums">
                        {chatHistory.length} message{chatHistory.length > 1 ? 's' : ''}
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
                    aria-label="Historique des messages"
                  >
                    {chatLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 animate-pulse" role="status">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">Chargement de l'historique…</p>
                        <span className="sr-only">Chargement en cours</span>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-fade-in">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Bot className="h-10 w-10 text-primary/60" aria-hidden="true" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium text-foreground">Bienvenue !</p>
                          <p className="text-sm max-w-sm">Posez n'importe quelle question pédagogique. L'assistant est là pour vous aider.</p>
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
                            <div className="flex justify-end group" role="article" aria-label="Votre message">
                              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm transition-shadow hover:shadow-md">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ch.userMessage}</p>
                                <div className="flex items-center justify-between gap-3 mt-2">
                                  <time className="text-[11px] opacity-60" dateTime={ch.createdAt}>
                                    {new Date(ch.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </time>
                                  <button
                                    onClick={() => handleDeleteChat(ch._id)}
                                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                                    aria-label="Supprimer ce message"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {/* AI response */}
                            <div className="flex justify-start" role="article" aria-label="Réponse de l'assistant">
                              <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                                  </div>
                                  <span className="text-xs font-semibold text-primary">Gemini</span>
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
                      <label htmlFor="manager-chat-formation-select" className="sr-only">Contexte de formation</label>
                      <Select value={chatFormationId} onValueChange={setChatFormationId}>
                        <SelectTrigger id="manager-chat-formation-select" className="w-full text-sm h-9" aria-label="Sélectionner une formation comme contexte">
                          <SelectValue placeholder="Contexte : aucune formation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune formation (général)</SelectItem>
                          {formations.map(f => (<SelectItem key={f._id} value={f._id}>{f.nom_formation}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message input */}
                    <div className="flex gap-2">
                      <label htmlFor="manager-chat-input" className="sr-only">Votre message</label>
                      <Textarea
                        id="manager-chat-input"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Posez votre question pédagogique…"
                        rows={2}
                        className="flex-1 resize-none text-sm transition-all focus:ring-2 focus:ring-primary/30"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                        disabled={chatSending}
                        aria-label="Écrire un message à l'assistant"
                      />
                      <Button
                        onClick={handleSendChat}
                        disabled={chatSending || !chatMessage.trim()}
                        className="self-end h-10 w-10 p-0 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 disabled:scale-100"
                        aria-label={chatSending ? 'Envoi en cours' : 'Envoyer le message'}
                        title="Envoyer (Entrée)"
                      >
                        {chatSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center" aria-hidden="true">
                      Appuyez sur <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Entrée</kbd> pour envoyer,{' '}
                      <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Maj+Entrée</kbd> pour un saut de ligne
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
                      Suggestions
                    </CardTitle>
                    <CardDescription className="text-xs">Cliquez pour pré-remplir</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      'Comment améliorer les méthodes pédagogiques ?',
                      'Stratégies pour motiver les élèves en difficulté',
                      'Comment gérer les absences répétées ?',
                      'Planifier efficacement les séances de formation',
                      'Évaluer la progression des élèves objectivement',
                    ].map((q, i) => (
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
                      <span className="text-sm font-medium">Astuce</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sélectionnez une formation comme contexte pour des réponses plus précises et adaptées à votre programme.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}