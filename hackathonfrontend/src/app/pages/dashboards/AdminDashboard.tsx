import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { formationApi, FormationStats, FormationDetailed } from '../../../services/formationApi';
import { logsApi, Log, LogFilters, LogAction, LogType } from '../../../services/logsApi';
import { analyticsApi, AnalyticsData } from '../../../services/analyticsApi';
import { userApi, User } from '../../../services/userApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { StatsCard } from '../../components/StatsCard';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Progress } from '../../components/ui/progress';
import { 
  BookOpen,
  Users, 
  TrendingUp, 
  Briefcase, 
  Activity,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  AlertCircle,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  GraduationCap,
  Award,
  UserCheck,
  BarChart3,
  Percent,
  Layers,
  Calendar,
  ChevronDown,
  Eye,
  Hash,
  MapPin,
  ArrowLeftRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { useTranslation } from '../../lib/i18n';

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formationStats, setFormationStats] = useState<FormationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Formations state
  const [formations, setFormations] = useState<FormationDetailed[]>([]);
  const [formationsLoading, setFormationsLoading] = useState(true);
  const [formationSearch, setFormationSearch] = useState('');
  const [expandedFormation, setExpandedFormation] = useState<string>('');

  // Logs state
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logFilters, setLogFilters] = useState<LogFilters>({});
  const [selectedLogType, setSelectedLogType] = useState<string>('all');
  const [selectedLogAction, setSelectedLogAction] = useState<string>('all');
  const [selectedLogMethod, setSelectedLogMethod] = useState<string>('all');

  const { t } = useTranslation();

  // Fetch formation stats and users on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setStatsLoading(true);
        setUsersLoading(true);
        
        const [stats, usersData, analyticsData, formationsData] = await Promise.all([
          formationApi.getFormationStats(),
          userApi.getAllUsers(),
          analyticsApi.getDashboardStats().catch(() => null),
          formationApi.getAllFormationsDetailed().catch(() => [] as FormationDetailed[]),
        ]);
        
        setFormationStats(stats);
        setUsers(usersData);
        if (analyticsData) setAnalytics(analyticsData);
        setAnalyticsLoading(false);
        setFormations(formationsData);
        setFormationsLoading(false);
      } catch (error) {
        console.error(t('messages.failedLoadData'), error);
        setFormationStats({ totalFormations: 0, totalInstructors: 0, totalManagers: 0 });
        setUsers([]);
        setFormations([]);
        setFormationsLoading(false);
      } finally {
        setStatsLoading(false);
        setUsersLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch logs
  const loadLogs = async (page = 1, filters?: LogFilters) => {
    try {
      setLogsLoading(true);
      const response = await logsApi.getAllLogs(page, 20, filters);
      setLogs(response.logs);
      setLogsPage(response.page);
      setLogsTotalPages(response.totalPages);
      setLogsTotal(response.total);
    } catch (error) {
      console.error(t('messages.failedLoadLogs'), error);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // Load logs on mount and when filters change
  useEffect(() => {
    loadLogs(logsPage, logFilters);
  }, [logsPage, logFilters]);

  // Handle filter changes
  const handleLogTypeFilter = (value: string) => {
    setSelectedLogType(value);
    setLogsPage(1);
    if (value === 'all') {
      const { type, ...rest } = logFilters;
      setLogFilters(rest);
    } else {
      setLogFilters({ ...logFilters, type: value as LogType });
    }
  };

  const handleLogActionFilter = (value: string) => {
    setSelectedLogAction(value);
    setLogsPage(1);
    if (value === 'all') {
      const { action, ...rest } = logFilters;
      setLogFilters(rest);
    } else {
      setLogFilters({ ...logFilters, action: value as LogAction });
    }
  };

  const handleLogMethodFilter = (value: string) => {
    setSelectedLogMethod(value);
    setLogsPage(1);
    if (value === 'all') {
      const { method, ...rest } = logFilters;
      setLogFilters(rest);
    } else {
      setLogFilters({ ...logFilters, method: value });
    }
  };

  const refreshLogs = () => {
    loadLogs(logsPage, logFilters);
  };

  // Mock data
  const stats = [
    {
      title: t('common.formations'),
      value: analytics?.totalFormations?.toString() || formationStats?.totalFormations?.toString() || '0',
      description: `${analytics?.formationsActives || 0} ${t('common.active')}, ${analytics?.formationsInactives || 0} ${t('common.inactive')}`,
      icon: BookOpen,
      trend: undefined,
    },
    {
      title: t('common.instructors'),
      value: analytics?.totalFormateurs?.toString() || formationStats?.totalInstructors?.toString() || '0',
      description: t('adminDashboard.numberOfInstructors'),
      icon: Users,
      trend: undefined,
    },
    {
      title: 'Élèves',
      value: analytics?.totalEleves?.toString() || '0',
      description: `${analytics?.elevesActifs || 0} actifs`,
      icon: GraduationCap,
      trend: undefined,
    },
    {
      title: 'Inscriptions',
      value: analytics?.totalInscriptions?.toString() || '0',
      description: `${analytics?.inscriptionsByStatus?.en_cours || 0} en cours`,
      icon: TrendingUp,
      trend: undefined,
    },
  ];

  // Charts colors
  const COLORS = ['#0f4c81', '#e06d14', '#eab308', '#ef4444', '#0f4c81', '#60a5fa'];

  const inscriptionStatusData = analytics ? [
    { name: 'En cours', value: analytics.inscriptionsByStatus.en_cours, color: '#0f4c81' },
    { name: 'Complétées', value: analytics.inscriptionsByStatus.completee, color: '#eab308' },
    { name: 'Abandonnées', value: analytics.inscriptionsByStatus.abandonnee, color: '#ef4444' },
  ] : [];

  const presenceData = analytics ? [
    { name: t('adminDashboard.presentsLabel'), value: analytics.presencePresent, color: '#0f4c81' },
    { name: t('adminDashboard.absentsLabel'), value: analytics.presenceAbsent, color: '#ef4444' },
  ] : [];

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      mot_de_passe: ''
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser || !editingUser.id) return;
      
      if (!formData.nom || !formData.prenom || !formData.email) {
        toast.error(t('adminDashboard.fillAllFields'));
        return;
      }

      setIsSubmitting(true);
      
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        ...(formData.mot_de_passe && { mot_de_passe: formData.mot_de_passe })
      };
      
      await userApi.updateUser(editingUser.id, payload);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...payload }
          : u
      ));
      
      setEditingUser(null);
      setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
      setIsEditUserOpen(false);
      
      toast.success(t('adminDashboard.userUpdated'));
    } catch (error) {
      console.error(t('messages.errorUpdatingUser'), error);
      toast.error(t('adminDashboard.userUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      if (!userToDelete || !userToDelete.id) return;

      setIsSubmitting(true);
      await userApi.deleteUser(userToDelete.id);
      
      // Remove the user from the list
      setUsers(users.filter(u => u.id !== userToDelete.id));
      
      setUserToDelete(null);
      setIsDeleteConfirmOpen(false);
      
      toast.success(t('adminDashboard.userDeleted'));
    } catch (error) {
      console.error(t('messages.errorDeletingUser'), error);
      toast.error(t('adminDashboard.userDeleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUser = async () => {
    try {
      if (!formData.nom || !formData.prenom || !formData.email || !formData.mot_de_passe) {
        toast.error(t('adminDashboard.fillAllFields'));
        return;
      }

      setIsSubmitting(true);
      
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
      };
      
      console.log(t('messages.sendingPayload'), payload);
      
      const newUser = await userApi.createUser(payload);
      
      console.log(t('messages.userCreated'), newUser);

      // Add the new user to the list
      setUsers([...users, newUser]);
      
      // Reset form
      setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
      setIsAddUserOpen(false);
      
      toast.success(t('adminDashboard.userAdded'));
    } catch (error) {
      console.error(t('messages.errorAddingUser'), error);
      toast.error(t('adminDashboard.userAddError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'Formateurs' ? 'responsableformation' : 'Formateurs';
    const newRoleLabel = newRole === 'Formateurs' ? 'Formateur' : 'Responsable';
    try {
      await userApi.updateUserRole(user.id, newRole);
      setUsers(users.map(u =>
        u.id === user.id ? { ...u, role: newRole } : u
      ));
      toast.success(`Rôle de ${user.prenom} ${user.nom} changé en ${newRoleLabel}`);
    } catch (error) {
      console.error(t('messages.errorTogglingRole'), error);
      toast.error(t('messages.errorTogglingRole'));
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'destructive';
      case 'responsableformation':
        return 'default';
      case 'Formateurs':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Admin';
      case 'responsableformation':
        return 'Responsable';
      case 'Formateurs':
        return 'Formateur';
      default:
        return role;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="mb-2">{t('adminDashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('adminDashboard.subtitle')}
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 w-fit mx-auto">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{t('adminDashboard.users')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>{t('adminDashboard.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>{t('adminDashboard.roles')}</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span>{t('adminDashboard.activity')}</span>
            </TabsTrigger>
            <TabsTrigger value="formations" className="gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{t('common.formations')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>{t('adminDashboard.userManagement')}</h2>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                    aria-label={t('common.search')}
                  />
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      {t('adminDashboard.addUser')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('adminDashboard.addUser')}</DialogTitle>
                      <DialogDescription>
                        {t('adminDashboard.addUserDesc')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-nom">{t('common.name')}</Label>
                        <Input 
                          id="new-nom" 
                          placeholder="Dupont" 
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-prenom">{t('common.firstName')}</Label>
                        <Input 
                          id="new-prenom" 
                          placeholder="Jean" 
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">{t('common.email')}</Label>
                        <Input 
                          id="new-email" 
                          type="email" 
                          placeholder="jean.dupont@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">{t('common.password')}</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          placeholder={t('adminDashboard.minChars')} 
                          value={formData.mot_de_passe}
                          onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddUserOpen(false)}
                        disabled={isSubmitting}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        onClick={handleAddUser}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('adminDashboard.creating') : t('adminDashboard.createUser')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('adminDashboard.editUser')}</DialogTitle>
                      <DialogDescription>
                        Modifiez les informations de {editingUser?.prenom} {editingUser?.nom}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-nom">{t('common.name')}</Label>
                        <Input 
                          id="edit-nom" 
                          placeholder="Dupont" 
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-prenom">{t('common.firstName')}</Label>
                        <Input 
                          id="edit-prenom" 
                          placeholder="Jean" 
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">{t('common.email')}</Label>
                        <Input 
                          id="edit-email" 
                          type="email" 
                          placeholder="jean.dupont@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-password">{t('common.password')} (optionnel)</Label>
                        <Input 
                          id="edit-password" 
                          type="password" 
                          placeholder="Laisser vide pour ne pas changer" 
                          value={formData.mot_de_passe}
                          onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditUserOpen(false)}
                        disabled={isSubmitting}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        onClick={handleUpdateUser}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('adminDashboard.updating') : t('adminDashboard.update')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('adminDashboard.confirmDelete')}</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer {userToDelete?.prenom} {userToDelete?.nom} ? Cette action est irréversible.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        disabled={isSubmitting}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={confirmDeleteUser}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('adminDashboard.deleting') : t('common.delete')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('adminDashboard.users')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('common.email')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">{t('adminDashboard.roles')}</th>
                        <th scope="col" className="px-6 py-4 text-left font-medium">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users
                        .filter(user => {
                          const searchLower = searchQuery.toLowerCase();
                          return (
                            user.nom.toLowerCase().includes(searchLower) ||
                            user.prenom.toLowerCase().includes(searchLower) ||
                            user.email.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {`${(user.nom || '')[0] || ''}${(user.prenom || '')[0] || ''}`}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{`${user.prenom} ${user.nom}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-muted-foreground">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getRoleBadgeVariant(user.role) as any}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {(user.role === 'Formateurs' || user.role === 'responsableformation') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs transition-colors"
                                  onClick={() => handleToggleRole(user)}
                                  aria-label={`Changer le rôle de ${user.prenom} ${user.nom} de ${getRoleLabel(user.role)} vers ${user.role === 'Formateurs' ? 'Responsable' : 'Formateur'}`}
                                  title={user.role === 'Formateurs' ? t('adminDashboard.switchToManager') : t('adminDashboard.switchToInstructor')}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span className="hidden sm:inline">
                                    {user.role === 'Formateurs' ? 'Responsable' : 'Formateur'}
                                  </span>
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditUser(user)}
                                aria-label={`Modifier ${user.prenom} ${user.nom}`}
                              >
                                <Edit className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteUser(user)}
                                aria-label={`Supprimer ${user.prenom} ${user.nom}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2>{t('adminDashboard.analyticsStats')}</h2>
              <Button variant="outline" size="sm" onClick={async () => {
                setAnalyticsLoading(true);
                try {
                  const data = await analyticsApi.getDashboardStats();
                  setAnalytics(data);
                } catch (e) { console.error(e); }
                setAnalyticsLoading(false);
              }} disabled={analyticsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Actualiser
              </Button>
            </div>

            {analyticsLoading && !analytics ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="ml-2 text-muted-foreground">{t('adminDashboard.loadingStats')}</span>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              
                  <Card>
                    <CardContent className="pt-3">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Briefcase className="h-8 w-8 text-warning" aria-hidden="true" />
                        <p className="text-3xl font-bold">{analytics?.totalResponsables || 0}</p>
                        <p className="text-xs text-muted-foreground">{t('adminDashboard.managers')}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Award className="h-8 w-8 text-destructive" aria-hidden="true" />
                        <p className="text-3xl font-bold">{analytics?.totalCertifications || 0}</p>
                        <p className="text-xs text-muted-foreground">Certifications</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
                        <p className="text-3xl font-bold">{analytics?.totalSeances || 0}</p>
                        <p className="text-xs text-muted-foreground">{t('adminDashboard.totalSessions')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Taux (rates) Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                          <UserCheck className="h-6 w-6 text-green-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.tauxPresence || 0}%</p>
                          <p className="text-sm text-muted-foreground">{t('adminDashboard.presenceRate')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.tauxCompletion || 0}%</p>
                          <p className="text-sm text-muted-foreground">{t('adminDashboard.completionRate')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                          <XCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.tauxAbandon || 0}%</p>
                          <p className="text-sm text-muted-foreground">{t('adminDashboard.abandonRate')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Élèves par formation */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>{t('adminDashboard.studentsByFormation')}</CardTitle>
                      <CardDescription>{t('adminDashboard.studentsByFormationDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.elevesParFormation && analytics.elevesParFormation.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.elevesParFormation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="enCours" stackId="a" fill="#0f4c81" name="En cours" />
                            <Bar dataKey="completee" stackId="a" fill="#33b604" name="Complétées" />
                            <Bar dataKey="abandonnee" stackId="a" fill="#ef4444" name="Abandonnées" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                          <p className="text-muted-foreground">Aucune donnée d'inscription disponible</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Inscriptions mensuelles */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('adminDashboard.monthlyInscriptions')}</CardTitle>
                      <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics?.monthlyInscriptions || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="inscriptions" stroke="#0f4c81" strokeWidth={2} name="Inscriptions" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Nouveaux élèves par mois */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Nouveaux élèves</CardTitle>
                      <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics?.monthlyEleves || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="eleves" fill="#0f4c81" name="Élèves" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Répartition par rôle */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('adminDashboard.roleDistribution')}</CardTitle>
                      <CardDescription>Distribution des utilisateurs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics?.usersByRole || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#0f4c81"
                            dataKey="value"
                          >
                            {(analytics?.usersByRole || []).map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Statut des inscriptions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('adminDashboard.inscriptionStatus')}</CardTitle>
                      <CardDescription>Répartition en cours / complétées / abandonnées</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={inscriptionStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#0f4c81"
                            dataKey="value"
                          >
                            {inscriptionStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Présence */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('adminDashboard.globalPresence')}</CardTitle>
                      <CardDescription>Taux de présence aux séances</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={presenceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            fill="#0f4c81"
                            dataKey="value"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {presenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Tableau détaillé des formations */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('adminDashboard.detailByFormation')}</CardTitle>
                    <CardDescription>Statistiques d'inscription par formation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border bg-muted/50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left font-medium">Formation</th>
                            <th scope="col" className="px-6 py-4 text-center font-medium">Élèves</th>
                            <th scope="col" className="px-6 py-4 text-center font-medium">En cours</th>
                            <th scope="col" className="px-6 py-4 text-center font-medium">Complétées</th>
                            <th scope="col" className="px-6 py-4 text-center font-medium">Abandonnées</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {(analytics?.elevesParFormation || []).map((f, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                                  <span className="font-medium">{f.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge variant="outline">{f.eleves}</Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge variant="default">{f.enCours}</Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge className="bg-green-500 hover:bg-green-600">{f.completee}</Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge variant="destructive">{f.abandonnee}</Badge>
                              </td>
                            </tr>
                          ))}
                          {(!analytics?.elevesParFormation || analytics.elevesParFormation.length === 0) && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                Aucune formation disponible
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <h2>{t('adminDashboard.roleManagement')}</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" aria-hidden="true" />
                    {t('adminDashboard.adminRole')}
                  </CardTitle>
                  <CardDescription>
                    Accès complet à toutes les fonctionnalités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm" role="list">
                    <li>✓ {t('adminDashboard.adminPerm1')}</li>
                    <li>✓ {t('adminDashboard.adminPerm2')}</li>
                    <li>✓ {t('adminDashboard.adminPerm3')}</li>
                    <li>✓ {t('adminDashboard.adminPerm4')}</li>
                    <li>✓ {t('adminDashboard.adminPerm5')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    {t('common.manager')}
                  </CardTitle>
                  <CardDescription>
                    {t('adminDashboard.managerDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm" role="list">
                    <li>✓ {t('adminDashboard.managerPerm1')}</li>
                    <li>✓ {t('adminDashboard.managerPerm2')}</li>
                    <li>✓ {t('adminDashboard.managerPerm3')}</li>
                    <li>✓ {t('adminDashboard.managerPerm4')}</li>
                    <li>✗ {t('adminDashboard.managerPerm5')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" aria-hidden="true" />
                    {t('common.instructor')}
                  </CardTitle>
                  <CardDescription>
                    {t('adminDashboard.instructorDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm" role="list">
                    <li>✓ {t('adminDashboard.instructorPerm1')}</li>
                    <li>✓ {t('adminDashboard.instructorPerm2')}</li>
                    <li>✓ {t('adminDashboard.instructorPerm3')}</li>
                    <li>✓ {t('adminDashboard.instructorPerm4')}</li>
                    <li>✗ {t('adminDashboard.instructorPerm5')}</li>
                  </ul>
                </CardContent>
              </Card>


            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>{t('adminDashboard.activityLog')}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{logsTotal} {t('adminDashboard.totalActivities')}</span>
                <Button variant="outline" size="sm" onClick={refreshLogs} disabled={logsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  {t('adminDashboard.filters')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="filter-type">{t('adminDashboard.type')}</Label>
                    <Select value={selectedLogType} onValueChange={handleLogTypeFilter}>
                      <SelectTrigger id="filter-type">
                        <SelectValue placeholder={t('adminDashboard.allTypes')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('adminDashboard.allTypes')}</SelectItem>
                        <SelectItem value="info">{t('adminDashboard.info')}</SelectItem>
                        <SelectItem value="success">Succès</SelectItem>
                        <SelectItem value="warning">{t('adminDashboard.warning')}</SelectItem>
                        <SelectItem value="error">Erreur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-action">{t('adminDashboard.action')}</Label>
                    <Select value={selectedLogAction} onValueChange={handleLogActionFilter}>
                      <SelectTrigger id="filter-action">
                        <SelectValue placeholder={t('adminDashboard.allActions')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('adminDashboard.allActions')}</SelectItem>
                        <SelectItem value="CREATE">{t('adminDashboard.creation')}</SelectItem>
                        <SelectItem value="UPDATE">{t('adminDashboard.modification')}</SelectItem>
                        <SelectItem value="DELETE">{t('adminDashboard.deletion')}</SelectItem>
                        <SelectItem value="READ">{t('adminDashboard.reading')}</SelectItem>
                        <SelectItem value="LOGIN">Connexion</SelectItem>
                        <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                        <SelectItem value="REGISTER">Inscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-method">{t('adminDashboard.httpMethod')}</Label>
                    <Select value={selectedLogMethod} onValueChange={handleLogMethodFilter}>
                      <SelectTrigger id="filter-method">
                        <SelectValue placeholder={t('adminDashboard.allMethods')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('adminDashboard.allMethods')}</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs List */}
            <Card>
              <CardContent className="p-0">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
                    <span className="ml-2 text-muted-foreground">{t('adminDashboard.loadingActivities')}</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                    <p className="text-lg font-medium">{t('adminDashboard.noActivity')}</p>
                    <p className="text-sm text-muted-foreground">Les activités apparaîtront ici après création, modification ou suppression</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {logs.map((log) => (
                      <div key={log.id || log._id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                            log.type === 'error' ? 'bg-destructive/10' :
                            log.type === 'warning' ? 'bg-warning/10' :
                            log.type === 'success' ? 'bg-green-500/10' :
                            'bg-primary/10'
                          }`}>
                            {log.type === 'error' ? (
                              <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                            ) : log.type === 'warning' ? (
                              <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
                            ) : log.type === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                            ) : (
                              <Info className="h-5 w-5 text-primary" aria-hidden="true" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant={
                                log.type === 'error' ? 'destructive' :
                                log.type === 'warning' ? 'secondary' :
                                log.type === 'success' ? 'default' :
                                'outline'
                              }>
                                {log.type?.toUpperCase() || 'INFO'}
                              </Badge>
                              {log.action && (
                                <Badge variant="outline">{log.action}</Badge>
                              )}
                              {log.method && (
                                <Badge variant={
                                  log.method === 'POST' ? 'default' :
                                  log.method === 'PUT' || log.method === 'PATCH' ? 'secondary' :
                                  log.method === 'DELETE' ? 'destructive' :
                                  'outline'
                                } className="font-mono text-xs">
                                  {log.method}
                                </Badge>
                              )}
                              {log.statusCode && (
                                <Badge variant={
                                  log.statusCode >= 500 ? 'destructive' :
                                  log.statusCode >= 400 ? 'secondary' :
                                  'outline'
                                } className="font-mono text-xs">
                                  {log.statusCode}
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground font-medium mb-1">{log.message}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              {log.endpoint && (
                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[300px]">
                                  {log.endpoint}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                {new Date(log.timestamp || log.createdAt || '').toLocaleString('fr-FR')}
                              </span>
                              {log.duration && (
                                <span>{log.duration}ms</span>
                              )}
                            </div>
                            {(log.userName || log.userEmail) && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" aria-hidden="true" />
                                  {log.userName || log.userEmail}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {logsTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('adminDashboard.page')} {logsPage} {t('adminDashboard.of')} {logsTotalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                    disabled={logsPage <= 1 || logsLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))}
                    disabled={logsPage >= logsTotalPages || logsLoading}
                  >
                    {t('common.next')}
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Formations Tab */}
          <TabsContent value="formations" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>{t('adminDashboard.formationManagement')}</h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder={t('adminDashboard.searchFormation')}
                    value={formationSearch}
                    onChange={(e) => setFormationSearch(e.target.value)}
                    className="pl-10 w-full sm:w-72"
                    aria-label={t('adminDashboard.searchFormation')}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setFormationsLoading(true);
                    try {
                      const data = await formationApi.getAllFormationsDetailed();
                      setFormations(data);
                    } catch (e) { console.error(e); }
                    setFormationsLoading(false);
                  }}
                  disabled={formationsLoading}
                  aria-label={t('adminDashboard.refreshFormations')}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${formationsLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" role="region" aria-label="Résumé des formations">
              <Card className="transition-shadow duration-200 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
                    <p className="text-3xl font-bold">{formations.length}</p>
                    <p className="text-xs text-muted-foreground">{t('adminDashboard.totalFormations')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-200 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <GraduationCap className="h-8 w-8 text-success" aria-hidden="true" />
                    <p className="text-3xl font-bold">{formations.reduce((sum, f) => sum + f.totalEleves, 0)}</p>
                    <p className="text-xs text-muted-foreground">{t('adminDashboard.enrolledStudents')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-200 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Layers className="h-8 w-8 text-primary" aria-hidden="true" />
                    <p className="text-3xl font-bold">{formations.reduce((sum, f) => sum + f.totalNiveaux, 0)}</p>
                    <p className="text-xs text-muted-foreground">{t('adminDashboard.levels')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-200 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <BarChart3 className="h-8 w-8 text-warning" aria-hidden="true" />
                    <p className="text-3xl font-bold">{formations.reduce((sum, f) => sum + f.totalSeances, 0)}</p>
                    <p className="text-xs text-muted-foreground">Séances</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {formationsLoading ? (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="ml-2 text-muted-foreground">{t('adminDashboard.loadingFormations')}</span>
              </div>
            ) : formations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                  <p className="text-lg font-medium">{t('adminDashboard.noFormationFound')}</p>
                  <p className="text-sm text-muted-foreground">Les formations apparaîtront ici une fois créées</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion
                type="single"
                collapsible
                value={expandedFormation}
                onValueChange={setExpandedFormation}
                className="space-y-4"
              >
                {formations
                  .filter((f) => {
                    const q = formationSearch.toLowerCase();
                    return (
                      f.nom_formation.toLowerCase().includes(q) ||
                      f.description?.toLowerCase().includes(q) ||
                      f.id_formateur?.nom?.toLowerCase().includes(q) ||
                      f.id_formateur?.prenom?.toLowerCase().includes(q)
                    );
                  })
                  .map((formation) => {
                    const progressPercent = formation.totalSeances > 0
                      ? Math.round((formation.seancesValidees / formation.totalSeances) * 100)
                      : 0;

                    return (
                      <AccordionItem
                        key={formation._id}
                        value={formation._id}
                        className="border rounded-lg px-0 overflow-hidden transition-shadow duration-200 hover:shadow-md data-[state=open]:shadow-lg"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex flex-1 flex-col gap-3 text-left sm:flex-row sm:items-center sm:gap-6">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{formation.nom_formation}</p>
                                {formation.id_formateur && (
                                  <p className="text-xs text-muted-foreground">
                                    {formation.id_formateur.prenom} {formation.id_formateur.nom}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <Badge variant={formation.statut === 'active' ? 'default' : 'secondary'}>
                                {formation.statut === 'active' ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <GraduationCap className="h-3 w-3" aria-hidden="true" />
                                {formation.totalEleves} élève{formation.totalEleves !== 1 ? 's' : ''}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Layers className="h-3 w-3" aria-hidden="true" />
                                {formation.niveauxCompletes}/{formation.totalNiveaux}
                              </Badge>
                              <span className="hidden text-xs text-muted-foreground sm:inline" aria-label={`Progression: ${progressPercent}%`}>
                                {progressPercent}%
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-6">
                          {/* Formation details header */}
                          <div className="mb-6 space-y-4">
                            {formation.description && (
                              <p className="text-sm text-muted-foreground">{formation.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                Créée le {new Date(formation.date_creation).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                {formation.seancesValidees}/{formation.totalSeances} {t('adminDashboard.validatedSessions')}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{t('adminDashboard.globalProgression')}</span>
                                <span className="font-medium">{progressPercent}%</span>
                              </div>
                              <Progress value={progressPercent} aria-label={`Progression de la formation: ${progressPercent}%`} />
                            </div>
                          </div>

                          {/* Niveaux & Séances */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                              {t('adminDashboard.levelsAndSessions')}
                            </h3>

                            <div className="grid gap-3">
                              {formation.niveaux.map((niveau) => {
                                const niveauSeancesValidees = niveau.seances.filter(s => s.statut).length;
                                const niveauProgress = niveau.seances.length > 0
                                  ? Math.round((niveauSeancesValidees / niveau.seances.length) * 100)
                                  : 0;

                                return (
                                  <Card
                                    key={niveau._id}
                                    className={`transition-all duration-200 ${niveau.statut ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}
                                  >
                                    <CardHeader className="pb-3 pt-4 px-4">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                                            niveau.statut
                                              ? 'bg-green-500 text-white'
                                              : 'bg-muted text-muted-foreground'
                                          }`}>
                                            {niveau.numero_niveau}
                                          </div>
                                          {niveau.nom_niveau}
                                          {niveau.statut && (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs" variant="outline">
                                              <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                                              Complété
                                            </Badge>
                                          )}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground" aria-label={`${niveauSeancesValidees} séances validées sur ${niveau.seances.length}`}>
                                          {niveauSeancesValidees}/{niveau.seances.length} séances
                                        </span>
                                      </div>
                                      <Progress
                                        value={niveauProgress}
                                        className="h-1.5 mt-2"
                                        aria-label={`Progression du ${niveau.nom_niveau}: ${niveauProgress}%`}
                                      />
                                    </CardHeader>
                                    <CardContent className="px-4 pb-3 pt-0">
                                      <div className="grid gap-1.5" role="list" aria-label={`Séances du ${niveau.nom_niveau}`}>
                                        {niveau.seances.map((seance) => (
                                          <div
                                            key={seance._id}
                                            role="listitem"
                                            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                                              seance.statut
                                                ? 'bg-green-500/10 text-foreground'
                                                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              {seance.statut ? (
                                                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-500" aria-label="Validée" />
                                              ) : (
                                                <Hash className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                              )}
                                              <span className="truncate">
                                                <span className="font-medium">S{seance.numero_seance}.</span> {seance.titre}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                              {seance.date_prevue && (
                                                <span className="hidden text-xs sm:inline">
                                                  {new Date(seance.date_prevue).toLocaleDateString('fr-FR')}
                                                </span>
                                              )}
                                              {seance.heure_debut && seance.heure_fin && (
                                                <span className="hidden text-xs lg:inline">
                                                  {seance.heure_debut} - {seance.heure_fin}
                                                </span>
                                              )}
                                              <Badge
                                                variant={seance.statut ? 'default' : 'outline'}
                                                className={`text-xs ${seance.statut ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                              >
                                                {seance.statut ? t('adminDashboard.validated') : t('adminDashboard.pending')}
                                              </Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>

                          {/* Élèves inscrits */}
                          <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                              Élèves inscrits ({formation.inscriptions.length})
                            </h3>

                            {formation.inscriptions.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg bg-muted/30">
                                <Users className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
                                <p className="text-sm text-muted-foreground">Aucun élève inscrit à cette formation</p>
                              </div>
                            ) : (
                              <Card>
                                <CardContent className="p-0">
                                  <div className="overflow-x-auto">
                                    <table className="w-full" aria-label={`Élèves inscrits à ${formation.nom_formation}`}>
                                      <thead className="border-b border-border bg-muted/50">
                                        <tr>
                                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Élève</th>
                                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Contact</th>
                                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Niveau</th>
                                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Statut</th>
                                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider hidden md:table-cell">Date inscription</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {formation.inscriptions.map((inscription) => {
                                          const eleve = inscription.id_eleve;
                                          if (!eleve || typeof eleve === 'string') return null;

                                          return (
                                            <tr key={inscription._id} className="hover:bg-muted/30 transition-colors">
                                              <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                      {(eleve.prenom?.[0] || '')}{(eleve.nom?.[0] || '')}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span className="font-medium text-sm">{eleve.prenom} {eleve.nom}</span>
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 hidden sm:table-cell">
                                                <div className="text-sm text-muted-foreground">
                                                  {eleve.email && <p className="truncate max-w-[200px]">{eleve.email}</p>}
                                                  {eleve.telephone && <p className="text-xs">{eleve.telephone}</p>}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className="font-mono">
                                                  {inscription.niveau_actuel}/4
                                                </Badge>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <Badge variant={
                                                  inscription.statut_formation === 'completee' ? 'default' :
                                                  inscription.statut_formation === 'abandonnee' ? 'destructive' :
                                                  'secondary'
                                                }
                                                  className={inscription.statut_formation === 'completee' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                  {inscription.statut_formation === 'en_cours' ? 'En cours' :
                                                   inscription.statut_formation === 'completee' ? 'Complétée' :
                                                   inscription.statut_formation === 'abandonnee' ? 'Abandonnée' :
                                                   inscription.statut_formation}
                                                </Badge>
                                              </td>
                                              <td className="px-4 py-3 text-right hidden md:table-cell">
                                                <span className="text-sm text-muted-foreground">
                                                  {new Date(inscription.date_inscription).toLocaleDateString('fr-FR')}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            )}
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
