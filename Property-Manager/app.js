// Initialize Lucide Icons
lucide.createIcons();

// Chart Configuration Defaults
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
Chart.defaults.plugins.tooltip.bodyColor = '#f8fafc';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

const chartInstances = {};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    i18next.init({
        lng: 'fr',
        fallbackLng: 'fr',
        resources: resources
    }, function(err, t) {
        if (err) return console.error('i18next init error', err);
        
        // Fetch live dashboard data from backend server, falling back to mock data on error
        fetch('/api/dashboard-data')
            .then(res => {
                if (!res.ok) throw new Error('API response error');
                return res.json();
            })
            .then(data => {
                dashboardData = data;
                initCharts();
                initTheme();
                initTranslatorUI();
                initMobileMenu();
                updateLanguageContent();
            })
            .catch(error => {
                console.warn('Could not load live dashboard data from server, falling back to static mock data:', error);
                initCharts();
                initTheme();
                initTranslatorUI();
                initMobileMenu();
                updateLanguageContent();
            });
    });
});

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    const views = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('view-title');
    const subtitle = document.querySelector('.subtitle');
    const mobileDropdown = document.getElementById('mobile-menu-dropdown');

    const viewDetails = {
        global: { title: "title_global", subtitle: "subtitle_global" },
        financial: { title: "title_financial", subtitle: "subtitle_financial" },
        commercial: { title: "title_commercial", subtitle: "subtitle_commercial" },
        operational: { title: "title_operational", subtitle: "subtitle_operational" },
        buildings: { title: "title_buildings", subtitle: "subtitle_buildings" }
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.getAttribute('data-view');

            // Sync active states on all corresponding buttons
            navBtns.forEach(b => {
                if (b.getAttribute('data-view') === viewId) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });

            // Toggle active view
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${viewId}`).classList.add('active');

            // Update Header attributes and text dynamically
            const titleKey = viewDetails[viewId].title;
            const subtitleKey = viewDetails[viewId].subtitle;
            viewTitle.setAttribute('data-i18n', titleKey);
            subtitle.setAttribute('data-i18n', subtitleKey);
            viewTitle.textContent = i18next.t(titleKey);
            subtitle.textContent = i18next.t(subtitleKey);

            // Auto-close mobile menu on selection
            if (mobileDropdown) {
                mobileDropdown.classList.remove('show');
                const backdrop = document.getElementById('mobile-menu-backdrop');
                if (backdrop) {
                    backdrop.classList.remove('show');
                }
            }
        });
    });
}

function populateKPIs() {
    const lang = i18next.language || 'fr';
    
    // Helper to format values dynamically for multi-languages
    const fmtVal = (val) => {
        if (typeof val !== 'string') return val;
        let clean = val;
        if (lang === 'en') {
            clean = clean.replace('jrs', 'days');
        } else if (lang === 'ru') {
            clean = clean.replace('jrs', 'дн');
        } else if (lang === 'ja') {
            clean = clean.replace('jrs', '日');
        } else if (lang === 'ar') {
            clean = clean.replace('jrs', 'يوم');
        }
        return clean;
    };

    // Global KPIs
    document.getElementById('kpi-global-revenue').textContent = dashboardData.global.kpi.revenue;
    document.getElementById('kpi-global-occupancy').textContent = dashboardData.global.kpi.occupancy;
    document.getElementById('kpi-global-requests').textContent = dashboardData.global.kpi.openRequests;
    document.getElementById('kpi-global-incidents').textContent = dashboardData.global.kpi.criticalIncidents;

    // Financial KPIs
    document.getElementById('kpi-fin-rent').textContent = dashboardData.financial.kpi.rentRevenue;
    document.getElementById('kpi-fin-collection').textContent = dashboardData.financial.kpi.collectionRate;
    document.getElementById('kpi-fin-opex').textContent = dashboardData.financial.kpi.operatingExpenses;
    document.getElementById('kpi-fin-margin').textContent = dashboardData.financial.kpi.netMargin;
    document.getElementById('kpi-fin-deposits').textContent = dashboardData.financial.kpi.activeDeposits;

    // Commercial KPIs
    document.getElementById('kpi-com-occupancy').textContent = dashboardData.commercial.kpi.occupancyRate;
    document.getElementById('kpi-com-delay').textContent = fmtVal(dashboardData.commercial.kpi.avgLeaseDelay);
    document.getElementById('kpi-com-deposits').textContent = dashboardData.commercial.kpi.depositsCollected;
    document.getElementById('kpi-com-turnover').textContent = dashboardData.commercial.kpi.tenantTurnover;

    // Operational KPIs
    document.getElementById('kpi-op-resolution').textContent = fmtVal(dashboardData.operational.kpi.avgResolutionTime);
    document.getElementById('kpi-op-open-requests').textContent = dashboardData.operational.kpi.openRequests;
    document.getElementById('kpi-op-cost-unit').textContent = dashboardData.operational.kpi.avgMaintenanceCost;
    document.getElementById('kpi-op-incidents').textContent = dashboardData.operational.kpi.criticalIncidents;
}

function initCharts() {
    // Colors
    const blue = '#3b82f6';
    const green = '#10b981';
    const purple = '#8b5cf6';
    const orange = '#f97316';
    const red = '#ef4444';

    // 1. Global: Revenue vs Expense
    const ctxGlobalRev = document.getElementById('globalRevenueChart').getContext('2d');
    chartInstances.globalRev = new Chart(ctxGlobalRev, {
        type: 'bar',
        data: {
            labels: getTranslatedLabels('months_full'),
            datasets: [
                {
                    label: i18next.t("chart_lbl_revenus"),
                    data: dashboardData.global.charts.revenueExpense.revenue,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: i18next.t("chart_lbl_depenses"),
                    data: dashboardData.global.charts.revenueExpense.expense,
                    type: 'line',
                    borderColor: orange,
                    backgroundColor: orange,
                    borderWidth: 3,
                    tension: 0.4,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Global: Incident Distribution
    const ctxGlobalInc = document.getElementById('globalIncidentChart').getContext('2d');
    chartInstances.globalInc = new Chart(ctxGlobalInc, {
        type: 'doughnut',
        data: {
            labels: getTranslatedLabels('incidents'),
            datasets: [{
                data: dashboardData.global.charts.incidentDistribution.data,
                backgroundColor: [blue, orange, purple, red, '#475569'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 3. Financial: Rev vs Cost
    const ctxFinRevCost = document.getElementById('financialRevCostChart').getContext('2d');
    chartInstances.finRevCost = new Chart(ctxFinRevCost, {
        type: 'bar',
        data: {
            labels: dashboardData.financial.charts.revVsCost.labels,
            datasets: [
                {
                    label: i18next.t("chart_lbl_rev_loyer"),
                    data: dashboardData.financial.charts.revVsCost.revenue,
                    backgroundColor: blue,
                    borderRadius: 4
                },
                {
                    label: i18next.t("chart_lbl_opex"),
                    data: dashboardData.financial.charts.revVsCost.costs,
                    backgroundColor: orange,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. Financial: Cost Structure
    const ctxFinCost = document.getElementById('financialCostStructureChart').getContext('2d');
    chartInstances.finCost = new Chart(ctxFinCost, {
        type: 'pie',
        data: {
            labels: getTranslatedLabels('costs'),
            datasets: [{
                data: dashboardData.financial.charts.costStructure.data,
                backgroundColor: [blue, purple, orange, green, '#475569'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // 5. Commercial: Occupancy Trend
    const ctxComOcc = document.getElementById('commercialOccupancyChart').getContext('2d');
    chartInstances.comOcc = new Chart(ctxComOcc, {
        type: 'line',
        data: {
            labels: getTranslatedLabels('months_full'),
            datasets: [{
                label: i18next.t("chart_lbl_occupancy"),
                data: dashboardData.commercial.charts.occupancyTrend.data,
                borderColor: green,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 6. Commercial: Lease Expirations
    const ctxComLease = document.getElementById('commercialLeaseChart').getContext('2d');
    chartInstances.comLease = new Chart(ctxComLease, {
        type: 'bar',
        data: {
            labels: dashboardData.commercial.charts.leaseExpirations.labels,
            datasets: [{
                label: i18next.t("chart_lbl_lease_exp"),
                data: dashboardData.commercial.charts.leaseExpirations.data,
                backgroundColor: purple,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 6b. Commercial: Unit Typology
    const ctxComType = document.getElementById('commercialTypologyChart').getContext('2d');
    chartInstances.comType = new Chart(ctxComType, {
        type: 'doughnut',
        data: {
            labels: getTranslatedLabels('unit_types'),
            datasets: [{
                data: dashboardData.commercial.charts.unitTypology.data,
                backgroundColor: [blue, green, purple, orange],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 7. Operational: Resolution Time
    const ctxOpRes = document.getElementById('operationalResolutionChart').getContext('2d');
    chartInstances.opRes = new Chart(ctxOpRes, {
        type: 'line',
        data: {
            labels: getTranslatedLabels('months_six'),
            datasets: [
                {
                    label: i18next.t("chart_lbl_actual"),
                    data: dashboardData.operational.charts.resolutionTimeTrend.actual,
                    borderColor: blue,
                    backgroundColor: blue,
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: i18next.t("chart_lbl_target"),
                    data: dashboardData.operational.charts.resolutionTimeTrend.target,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 6, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 8. Operational: Requests by Category
    const ctxOpReq = document.getElementById('operationalRequestsChart').getContext('2d');
    chartInstances.opReq = new Chart(ctxOpReq, {
        type: 'bar',
        data: {
            labels: getTranslatedLabels('incidents'),
            datasets: [{
                label: i18next.t("chart_lbl_num_requests"),
                data: dashboardData.operational.charts.requestsByCategory.data,
                backgroundColor: [blue, orange, purple, '#475569', green],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// --- TRANSLATOR LOGIC & i18next CONFIGURATION ---
const resources = {
  fr: {
    translation: {
      logo_title: "Property",
      logo_span: "Manager",
      nav_global: "Vue Globale",
      nav_financial: "Vue Financière",
      nav_commercial: "Vue Commerciale",
      nav_operational: "Vue Opérationnelle",
      title_global: "Vue Globale",
      subtitle_global: "Performance générale du parc immobilier",
      title_financial: "Vue Financière",
      subtitle_financial: "Revenus, loyers et dépenses",
      title_commercial: "Vue Commerciale",
      subtitle_commercial: "Occupation, baux et locataires",
      title_operational: "Vue Opérationnelle",
      subtitle_operational: "Maintenance et incidents",
      kpi_revenus_totaux: "Revenus Totaux",
      kpi_taux_occupation: "Taux d'Occupation",
      kpi_demandes_ouvertes: "Demandes Ouvertes",
      kpi_incidents_critiques: "Incidents Critiques",
      kpi_revenus_loyers: "Revenus Loyers",
      kpi_taux_collecte: "Taux de Collecte",
      kpi_depenses_opex: "Dépenses (OPEX)",
      kpi_marge_nette: "Marge Nette",
      kpi_depots_garantie: "Dépôts de Garantie",
      kpi_delai_moyen_location: "Délai Moyen Location",
      kpi_depots_collectes: "Dépôts Collectés (YTD)",
      kpi_rotation_locataires: "Rotation Locataires",
      kpi_delai_moyen_resolution: "Délai Moyen Résolution",
      kpi_cout_moyen_unite: "Coût Moyen par Unité",
      vs_n1: "vs N-1",
      chart_global_rev: "Évolution des Revenus & Dépenses",
      chart_global_incidents: "Répartition des Incidents",
      chart_fin_rev_cost: "Analyse Revenus vs Coûts",
      chart_fin_cost_structure: "Structure des Coûts",
      chart_com_occupancy: "Tendance du Taux d'Occupation (%)",
      chart_com_lease: "Échéances des Baux",
      chart_op_resolution: "Délai de Résolution vs Objectif (Jours)",
      chart_op_requests: "Demandes par Catégorie",
      chart_lbl_revenus: "Revenus (k€)",
      chart_lbl_depenses: "Dépenses (k€)",
      chart_lbl_rev_loyer: "Revenus Loyers (k€)",
      chart_lbl_opex: "OPEX (k€)",
      chart_lbl_occupancy: "Taux d'Occupation (%)",
      chart_lbl_lease_exp: "Baux Expirants",
      chart_lbl_actual: "Actuel (Jours)",
      chart_lbl_target: "Objectif (Jours)",
      chart_lbl_num_requests: "Nombre de Demandes",
      month_jan: "Jan", month_fev: "Fév", month_mar: "Mar", month_avr: "Avr",
      month_mai: "Mai", month_juin: "Juin", month_juil: "Juil", month_aout: "Août",
      month_sep: "Sep", month_oct: "Oct", month_nov: "Nov", month_dec: "Déc",
      incident_plomberie: "Plomberie",
      incident_electricite: "Électricité",
      incident_cvc: "CVC",
      incident_structure: "Structure",
      incident_autre: "Autre",
      cost_maintenance: "Maintenance",
      cost_services_publics: "Services Publics",
      cost_taxes: "Taxes",
      cost_assurances: "Assurances",
      cost_gestion: "Gestion",
      chart_com_typology: "Typologie du Parc",
      type_studio: "Studio",
      type_t2: "T2",
      type_t3: "T3",
      type_t4: "T4",
      doc_title: "Dashboard Dirigeants | Gestion Immobilière",
      tooltip_translate: "Traduire la page",
      tooltip_theme: "Changer de thème",
      trend_delay: "-2j",
      trend_resolution: "-0.5j",
      nav_buildings: "Bâtiments",
      title_buildings: "Vue Bâtiments",
      subtitle_buildings: "Liste et détails des bâtiments du parc",
      tbl_col_building_name: "Nom du Bâtiment",
      tbl_col_address: "Adresse",
      tbl_col_category: "Catégorie",
      tbl_col_available: "Appartements à Louer",
      tbl_col_total: "Total Unités",
      tbl_val_none: "Aucun",
      cat_mixed: "Mixte",
      cat_concrete: "Béton",
      cat_stone: "Pierre de taille",
      cat_wood: "Bois",
      cat_brick: "Brique"
    }
  },
  en: {
    translation: {
      logo_title: "Property",
      logo_span: "Manager",
      nav_global: "Global View",
      nav_financial: "Financial View",
      nav_commercial: "Commercial View",
      nav_operational: "Operational View",
      title_global: "Global View",
      subtitle_global: "General performance of the real estate portfolio",
      title_financial: "Financial View",
      subtitle_financial: "Revenues, rents, and expenses",
      title_commercial: "Commercial View",
      subtitle_commercial: "Occupancy, leases, and tenants",
      title_operational: "Operational View",
      subtitle_operational: "Maintenance and incidents",
      kpi_revenus_totaux: "Total Revenue",
      kpi_taux_occupation: "Occupancy Rate",
      kpi_demandes_ouvertes: "Open Requests",
      kpi_incidents_critiques: "Critical Incidents",
      kpi_revenus_loyers: "Rental Income",
      kpi_taux_collecte: "Collection Rate",
      kpi_depenses_opex: "Operating Expenses (OPEX)",
      kpi_marge_nette: "Net Margin",
      kpi_depots_garantie: "Security Deposits",
      kpi_delai_moyen_location: "Avg Rental Time",
      kpi_depots_collectes: "Collected Deposits (YTD)",
      kpi_rotation_locataires: "Tenant Turnover",
      kpi_delai_moyen_resolution: "Avg Resolution Time",
      kpi_cout_moyen_unite: "Avg Cost per Unit",
      vs_n1: "vs Y-1",
      chart_global_rev: "Revenue & Expense Trend",
      chart_global_incidents: "Incident Breakdown",
      chart_fin_rev_cost: "Revenue vs Cost Analysis",
      chart_fin_cost_structure: "Cost Structure",
      chart_com_occupancy: "Occupancy Rate Trend (%)",
      chart_com_lease: "Lease Expirations",
      chart_op_resolution: "Resolution Time vs Target (Days)",
      chart_op_requests: "Requests by Category",
      chart_lbl_revenus: "Revenue (k€)",
      chart_lbl_depenses: "Expenses (k€)",
      chart_lbl_rev_loyer: "Rental Income (k€)",
      chart_lbl_opex: "OPEX (k€)",
      chart_lbl_occupancy: "Occupancy Rate (%)",
      chart_lbl_lease_exp: "Expiring Leases",
      chart_lbl_actual: "Actual (Days)",
      chart_lbl_target: "Target (Days)",
      chart_lbl_num_requests: "Number of Requests",
      month_jan: "Jan", month_fev: "Feb", month_mar: "Mar", month_avr: "Apr",
      month_mai: "May", month_juin: "Jun", month_juil: "Jul", month_aout: "Aug",
      month_sep: "Sep", month_oct: "Oct", month_nov: "Nov", month_dec: "Dec",
      incident_plomberie: "Plumbing",
      incident_electricite: "Electricity",
      incident_cvc: "HVAC",
      incident_structure: "Structural",
      incident_autre: "Other",
      cost_maintenance: "Maintenance",
      cost_services_publics: "Utilities",
      cost_taxes: "Taxes",
      cost_assurances: "Insurance",
      cost_gestion: "Management",
      chart_com_typology: "Portfolio Composition",
      type_studio: "Studio",
      type_t2: "1-Bedroom (T2)",
      type_t3: "2-Bedroom (T3)",
      type_t4: "3-Bedroom (T4)",
      doc_title: "Executive Dashboard | Property Management",
      tooltip_translate: "Translate page",
      tooltip_theme: "Toggle theme",
      trend_delay: "-2d",
      trend_resolution: "-0.5d",
      nav_buildings: "Buildings",
      title_buildings: "Buildings View",
      subtitle_buildings: "List and details of portfolio buildings",
      tbl_col_building_name: "Building Name",
      tbl_col_address: "Address",
      tbl_col_category: "Category",
      tbl_col_available: "Apartments to Rent",
      tbl_col_total: "Total Units",
      tbl_val_none: "None",
      cat_mixed: "Mixed",
      cat_concrete: "Concrete",
      cat_stone: "Stone",
      cat_wood: "Wood",
      cat_brick: "Brick"
    }
  },
  ru: {
    translation: {
      logo_title: "Property",
      logo_span: "Manager",
      nav_global: "Общий вид",
      nav_financial: "Финансовый вид",
      nav_commercial: "Коммерческий вид",
      nav_operational: "Операционный вид",
      title_global: "Общий вид",
      subtitle_global: "Общие показатели портфеля недвижимости",
      title_financial: "Финансовый вид",
      subtitle_financial: "Доходы, арендная плата и расходы",
      title_commercial: "Коммерческий вид",
      subtitle_commercial: "Занятость, аренда и арендаторы",
      title_operational: "Операционный вид",
      subtitle_operational: "Техническое обслуживание и инциденты",
      kpi_revenus_totaux: "Общий доход",
      kpi_taux_occupation: "Уровень занятости",
      kpi_demandes_ouvertes: "Открытые заявки",
      kpi_incidents_critiques: "Критические инциденты",
      kpi_revenus_loyers: "Доход от аренды",
      kpi_taux_collecte: "Уровень сбора",
      kpi_depenses_opex: "Операционные расходы (OPEX)",
      kpi_marge_nette: "Чистая прибыль",
      kpi_depots_garantie: "Залоговые депозиты",
      kpi_delai_moyen_location: "Ср. время сдачи",
      kpi_depots_collectes: "Собранные депозиты YTD",
      kpi_rotation_locataires: "Ротация арендаторов",
      kpi_delai_moyen_resolution: "Ср. время разрешения",
      kpi_cout_moyen_unite: "Ср. стоимость на объект",
      vs_n1: "сравн. с N-1",
      chart_global_rev: "Динамика доходов и расходов",
      chart_global_incidents: "Распределение инцидентов",
      chart_fin_rev_cost: "Анализ доходов и расходов",
      chart_fin_cost_structure: "Структура расходов",
      chart_com_occupancy: "Тенденция уровня занятости (%)",
      chart_com_lease: "Истечение срока аренды",
      chart_op_resolution: "Время разрешения vs Цель (Дни)",
      chart_op_requests: "Заявки по категориям",
      chart_lbl_revenus: "Доход (k€)",
      chart_lbl_depenses: "Расходы (k€)",
      chart_lbl_rev_loyer: "Доход от аренды (k€)",
      chart_lbl_opex: "OPEX (k€)",
      chart_lbl_occupancy: "Уровень занятости (%)",
      chart_lbl_lease_exp: "Истекающие договоры",
      chart_lbl_actual: "Факт (Дни)",
      chart_lbl_target: "Цель (Дни)",
      chart_lbl_num_requests: "Количество заявок",
      month_jan: "Янв", month_fev: "Фев", month_mar: "Мар", month_avr: "Апр",
      month_mai: "Май", month_juin: "Июн", month_juil: "Июл", month_aout: "Авг",
      month_sep: "Сен", month_oct: "Окт", month_nov: "Ноя", month_dec: "Дек",
      incident_plomberie: "Сантехника",
      incident_electricite: "Электрика",
      incident_cvc: "Отопление/вентиляция",
      incident_structure: "Конструкции",
      incident_autre: "Другое",
      cost_maintenance: "Обслуживание",
      cost_services_publics: "Коммунальные услуги",
      cost_taxes: "Налоги",
      cost_assurances: "Страхование",
      cost_gestion: "Управление",
      chart_com_typology: "Состав портфеля",
      type_studio: "Студия",
      type_t2: "1-комнатная (T2)",
      type_t3: "2-комнатная (T3)",
      type_t4: "3-комнатная (T4)",
      doc_title: "Панель управления | Управление недвижимостью",
      tooltip_translate: "Перевести страницу",
      tooltip_theme: "Переключить тему",
      trend_delay: "-2 дн",
      trend_resolution: "-0.5 дн",
      nav_buildings: "Здания",
      title_buildings: "Панель зданий",
      subtitle_buildings: "Список и детали зданий портфеля",
      tbl_col_building_name: "Название здания",
      tbl_col_address: "Адрес",
      tbl_col_category: "Категория",
      tbl_col_available: "Свободно для аренды",
      tbl_col_total: "Всего единиц",
      tbl_val_none: "Нет",
      cat_mixed: "Смешанный",
      cat_concrete: "Бетон",
      cat_stone: "Камень",
      cat_wood: "Дерево",
      cat_brick: "Кирпич"
    }
  },
  ja: {
    translation: {
      logo_title: "Property",
      logo_span: "Manager",
      nav_global: "グローバルビュー",
      nav_financial: "財務ビュー",
      nav_commercial: "商業ビュー",
      nav_operational: "業務ビュー",
      title_global: "グローバルビュー",
      subtitle_global: "不動産ポートフォリオの全体的なパフォーマンス",
      title_financial: "財務ビュー",
      subtitle_financial: "収益、賃料、経費",
      title_commercial: "商業ビュー",
      subtitle_commercial: "稼働率、賃貸借、テナント",
      title_operational: "業務ビュー",
      subtitle_operational: "メンテナンスとインシデント",
      kpi_revenus_totaux: "総収益",
      kpi_taux_occupation: "稼働率",
      kpi_demandes_ouvertes: "未対応の要望",
      kpi_incidents_critiques: "重大なインシデント",
      kpi_revenus_loyers: "賃料収入",
      kpi_taux_collecte: "回収率",
      kpi_depenses_opex: "運営費 (OPEX)",
      kpi_marge_nette: "純利益率",
      kpi_depots_garantie: "敷金",
      kpi_delai_moyen_location: "平均賃貸期間",
      kpi_depots_collectes: "回収された敷金 (年初来)",
      kpi_rotation_locataires: "テナント入れ替え率",
      kpi_delai_moyen_resolution: "平均解決時間",
      kpi_cout_moyen_unite: "ユニットあたり平均コスト",
      vs_n1: "前年比",
      chart_global_rev: "収益と支出の推移",
      chart_global_incidents: "インシデントの内訳",
      chart_fin_rev_cost: "収益対コスト分析",
      chart_fin_cost_structure: "コスト構造",
      chart_com_occupancy: "稼働率の推移 (%)",
      chart_com_lease: "リースの満了",
      chart_op_resolution: "解決時間対目標 (日)",
      chart_op_requests: "カテゴリ別の要望",
      chart_lbl_revenus: "収益 (k€)",
      chart_lbl_depenses: "支出 (k€)",
      chart_lbl_rev_loyer: "賃料収入 (k€)",
      chart_lbl_opex: "OPEX (k€)",
      chart_lbl_occupancy: "稼働率 (%)",
      chart_lbl_lease_exp: "満了予定のリース",
      chart_lbl_actual: "実績 (日)",
      chart_lbl_target: "目標 (日)",
      chart_lbl_num_requests: "要望件数",
      month_jan: "1月", month_fev: "2月", month_mar: "3月", month_avr: "4月",
      month_mai: "5月", month_juin: "6月", month_juil: "7月", month_aout: "8月",
      month_sep: "9月", month_oct: "10月", month_nov: "11月", month_dec: "12月",
      incident_plomberie: "配管",
      incident_electricite: "電気",
      incident_cvc: "空調",
      incident_structure: "構造",
      incident_autre: "その他",
      cost_maintenance: "メンテナンス",
      cost_services_publics: "公共料金",
      cost_taxes: "税金",
      cost_assurances: "保険",
      cost_gestion: "管理",
      chart_com_typology: "物件ポートフォリオ構成",
      type_studio: "ワンルーム",
      type_t2: "1LDK (T2)",
      type_t3: "2LDK (T3)",
      type_t4: "3LDK (T4)",
      doc_title: "管理ダッシュボード | 不動産管理",
      tooltip_translate: "ページを翻訳",
      tooltip_theme: "テーマを切り替え",
      trend_delay: "-2日",
      trend_resolution: "-0.5日",
      nav_buildings: "建物",
      title_buildings: "建物一覧",
      subtitle_buildings: "ポートフォリオ内の建物リストと詳細",
      tbl_col_building_name: "建物名",
      tbl_col_address: "住所",
      tbl_col_category: "カテゴリ",
      tbl_col_available: "賃貸中/空き室",
      tbl_col_total: "総戸数",
      tbl_val_none: "なし",
      cat_mixed: "混合構造",
      cat_concrete: "鉄筋コンクリート",
      cat_stone: "石造",
      cat_wood: "木造",
      cat_brick: "レンガ"
    }
  },
  ar: {
    translation: {
      logo_title: "Property",
      logo_span: "Manager",
      nav_global: "عرض عام",
      nav_financial: "عرض مالي",
      nav_commercial: "عرض تجاري",
      nav_operational: "عرض تشغيلي",
      title_global: "عرض عام",
      subtitle_global: "الأداء العام لمحفظة العقارات",
      title_financial: "عرض مالي",
      subtitle_financial: "الإيرادات والإيجارات والمصاريف",
      title_commercial: "عرض تجاري",
      subtitle_commercial: "الإشغال والإيجارات والمستأجرين",
      title_operational: "عرض تشغيلي",
      subtitle_operational: "الصيانة والحوادث",
      kpi_revenus_totaux: "إجمالي الإيرادات",
      kpi_taux_occupation: "معدل الإشغال",
      kpi_demandes_ouvertes: "الطلبات المفتوحة",
      kpi_incidents_critiques: "الحوادث الحرجة",
      kpi_revenus_loyers: "إيرادات الإيجار",
      kpi_taux_collecte: "معدل التحصيل",
      kpi_depenses_opex: "المصاريف التشغيلية (OPEX)",
      kpi_marge_nette: "هامش الربح الصافي",
      kpi_depots_garantie: "ودائع الضمان",
      kpi_delai_moyen_location: "متوسط فترة الإيجار",
      kpi_depots_collectes: "الودائع المحصلة (منذ بداية العام)",
      kpi_rotation_locataires: "معدل دوران المستأجرين",
      kpi_delai_moyen_resolution: "متوسط وقت الحل",
      kpi_cout_moyen_unite: "متوسط التكلفة لكل وحدة",
      vs_n1: "مقارنة بالسنة السابقة",
      chart_global_rev: "اتجاه الإيرادات والمصروفات",
      chart_global_incidents: "توزيع الحوادث",
      chart_fin_rev_cost: "تحليل الإيرادات مقابل التكاليف",
      chart_fin_cost_structure: "هيكل التكاليف",
      chart_com_occupancy: "اتجاه معدل الإشغال (%)",
      chart_com_lease: "انتهاء عقود الإيجار",
      chart_op_resolution: "وقت الحل مقابل الهدف (أيام)",
      chart_op_requests: "الطلبات حسب الفئة",
      chart_lbl_revenus: "الإيرادات (آلاف يورو)",
      chart_lbl_depenses: "المصروفات (آلاف يورو)",
      chart_lbl_rev_loyer: "إيرادات الإيجار (آلاف يورو)",
      chart_lbl_opex: "التشغيلية (آلاف يورو)",
      chart_lbl_occupancy: "معدل الإشغال (%)",
      chart_lbl_lease_exp: "العقود المنتهية",
      chart_lbl_actual: "الفعلي (أيام)",
      chart_lbl_target: "المستهدف (أيام)",
      chart_lbl_num_requests: "عدد الطلبات",
      month_jan: "يناير", month_fev: "فبراير", month_mar: "مارس", month_avr: "أبريل",
      month_mai: "مايو", month_juin: "يونيو", month_juil: "يوليو", month_aout: "أغسطس",
      month_sep: "سبتمبر", month_oct: "أكتوبر", month_nov: "نوفمبر", month_dec: "ديسمبر",
      incident_plomberie: "السباكة",
      incident_electricite: "الكهرباء",
      incident_cvc: "التكييف والتهوية",
      incident_structure: "الهيكل",
      incident_autre: "أخرى",
      cost_maintenance: "الصيانة",
      cost_services_publics: "المرافق",
      cost_taxes: "الضرائب",
      cost_assurances: "التأمين",
      cost_gestion: "الإدارة",
      chart_com_typology: "تركيب المحفظة",
      type_studio: "استوديو",
      type_t2: "غرفة وصالة (T2)",
      type_t3: "غرفتين وصالة (T3)",
      type_t4: "ثلاث غرف وصالة (T4)",
      doc_title: "لوحة التحكم التنفيذية | إدارة العقارات",
      tooltip_translate: "ترجمة الصفحة",
      tooltip_theme: "تبديل المظهر",
      trend_delay: "-2 يوم",
      trend_resolution: "-0.5 يوم",
      nav_buildings: "المباني",
      title_buildings: "عرض المباني",
      subtitle_buildings: "قائمة وتفاصيل مباني المحفظة",
      tbl_col_building_name: "اسم المبنى",
      tbl_col_address: "العنوان",
      tbl_col_category: "الفئة",
      tbl_col_available: "شقق للإيجار",
      tbl_col_total: "إجمالي الوحدات",
      tbl_val_none: "لا يوجد",
      cat_mixed: "مختلط",
      cat_concrete: "خرسانة",
      cat_stone: "حجر",
      cat_wood: "خشب",
      cat_brick: "طوب"
    }
  }
};

function initTranslatorUI() {
    const toggleBtn = document.getElementById('translator-toggle-btn');
    const dropdown = document.getElementById('translator-dropdown');
    const options = document.querySelectorAll('.translator-option');
    const label = toggleBtn.querySelector('.translator-label');

    // Toggle dropdown
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');

        // Close mobile dropdown if open
        const mobileDropdown = document.getElementById('mobile-menu-dropdown');
        if (mobileDropdown) {
            mobileDropdown.classList.remove('show');
        }
    });

    // Click outside dismissal
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.translator-container')) {
            dropdown.classList.remove('show');
        }
    });

    // Language select
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const lang = opt.getAttribute('data-lang');
            
            // Toggle active styles
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            // Update button label
            label.textContent = lang.toUpperCase();
            dropdown.classList.remove('show');

            // Switch i18next language
            i18next.changeLanguage(lang, (err, t) => {
                if (err) return console.error('Language switch error', err);
                updateLanguageContent();
            });
        });
    });
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    const dropdown = document.getElementById('mobile-menu-dropdown');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    
    if (!toggleBtn || !dropdown) return;

    const toggleMenu = (show) => {
        const shouldShow = show !== undefined ? show : !dropdown.classList.contains('show');
        dropdown.classList.toggle('show', shouldShow);
        if (backdrop) {
            backdrop.classList.toggle('show', shouldShow);
        }
    };

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
        
        // Close translator dropdown if open
        const translatorDropdown = document.getElementById('translator-dropdown');
        if (translatorDropdown) {
            translatorDropdown.classList.remove('show');
        }
    });

    // Close on clicking backdrop
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            toggleMenu(false);
        });
    }

    // Close on clicking outside container
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-container')) {
            toggleMenu(false);
        }
    });
}

function updateLanguageContent() {
    // Translate standard data-i18n items
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = i18next.t(key);
    });

    // Translate page title and translator tooltip
    document.title = i18next.t('doc_title');
    const toggleBtn = document.getElementById('translator-toggle-btn');
    if (toggleBtn) {
        toggleBtn.setAttribute('title', i18next.t('tooltip_translate'));
    }

    // Translate theme switcher tooltip
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.setAttribute('title', i18next.t('tooltip_theme'));
    }

    // Refresh dynamic metrics
    populateKPIs();
    populateBuildingsTable();

    // Re-draw chart configurations
    updateChartsLanguage();
}

function getTranslatedLabels(type) {
    if (type === 'months_full') {
        return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map(m => {
            const key = `month_${m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("é", "e").replace("û", "u")}`;
            return i18next.t(key);
        });
    }
    if (type === 'months_six') {
        return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map(m => {
            const key = `month_${m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("é", "e")}`;
            return i18next.t(key);
        });
    }
    if (type === 'incidents') {
        return ['Plomberie', 'Électricité', 'CVC', 'Structure', 'Autre'].map(inc => {
            const key = `incident_${inc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("é", "e")}`;
            return i18next.t(key);
        });
    }
    if (type === 'costs') {
        return ['Maintenance', 'Services Publics', 'Taxes', 'Assurances', 'Gestion'].map(c => {
            const key = `cost_${c.toLowerCase().replace(" ", "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
            return i18next.t(key);
        });
    }
    if (type === 'unit_types') {
        return ['Studio', 'T2', 'T3', 'T4'].map(t => {
            const key = `type_${t.toLowerCase()}`;
            return i18next.t(key);
        });
    }
    return [];
}

function updateChartsLanguage() {
    if (chartInstances.globalRev) {
        chartInstances.globalRev.data.labels = getTranslatedLabels('months_full');
        chartInstances.globalRev.data.datasets[0].label = i18next.t("chart_lbl_revenus");
        chartInstances.globalRev.data.datasets[1].label = i18next.t("chart_lbl_depenses");
        chartInstances.globalRev.update();
    }
    if (chartInstances.globalInc) {
        chartInstances.globalInc.data.labels = getTranslatedLabels('incidents');
        chartInstances.globalInc.update();
    }
    if (chartInstances.finRevCost) {
        chartInstances.finRevCost.data.datasets[0].label = i18next.t("chart_lbl_rev_loyer");
        chartInstances.finRevCost.data.datasets[1].label = i18next.t("chart_lbl_opex");
        chartInstances.finRevCost.update();
    }
    if (chartInstances.finCost) {
        chartInstances.finCost.data.labels = getTranslatedLabels('costs');
        chartInstances.finCost.update();
    }
    if (chartInstances.comOcc) {
        chartInstances.comOcc.data.labels = getTranslatedLabels('months_full');
        chartInstances.comOcc.data.datasets[0].label = i18next.t("chart_lbl_occupancy");
        chartInstances.comOcc.update();
    }
    if (chartInstances.comLease) {
        chartInstances.comLease.data.datasets[0].label = i18next.t("chart_lbl_lease_exp");
        chartInstances.comLease.update();
    }
    if (chartInstances.opRes) {
        chartInstances.opRes.data.labels = getTranslatedLabels('months_six');
        chartInstances.opRes.data.datasets[0].label = i18next.t("chart_lbl_actual");
        chartInstances.opRes.data.datasets[1].label = i18next.t("chart_lbl_target");
        chartInstances.opRes.update();
    }
    if (chartInstances.opReq) {
        chartInstances.opReq.data.labels = getTranslatedLabels('incidents');
        chartInstances.opReq.data.datasets[0].label = i18next.t("chart_lbl_num_requests");
        chartInstances.opReq.update();
    }
    if (chartInstances.comType) {
        chartInstances.comType.data.labels = getTranslatedLabels('unit_types');
        chartInstances.comType.update();
    }
}

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    let currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
    
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', currentTheme === 'light' ? 'sun' : 'moon');
        lucide.createIcons();
    }
    
    updateChartsTheme(currentTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentTheme = document.documentElement.classList.contains('light-theme') ? 'dark' : 'light';
            
            if (currentTheme === 'light') {
                document.documentElement.classList.add('light-theme');
            } else {
                document.documentElement.classList.remove('light-theme');
            }
            
            localStorage.setItem('theme', currentTheme);
            
            if (themeIcon) {
                themeIcon.setAttribute('data-lucide', currentTheme === 'light' ? 'sun' : 'moon');
                lucide.createIcons();
            }
            
            updateChartsTheme(currentTheme);
        });
    }
}

function updateChartsTheme(theme) {
    const isLight = theme === 'light';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const targetLineColor = isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.3)';

    Chart.defaults.color = textColor;

    Object.values(chartInstances).forEach(chart => {
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                if (!chart.options.scales.x.ticks) chart.options.scales.x.ticks = {};
                chart.options.scales.x.ticks.color = textColor;
                if (chart.options.scales.x.grid) {
                    chart.options.scales.x.grid.color = gridColor;
                }
            }
            if (chart.options.scales.y) {
                if (!chart.options.scales.y.ticks) chart.options.scales.y.ticks = {};
                chart.options.scales.y.ticks.color = textColor;
                if (chart.options.scales.y.grid) {
                    chart.options.scales.y.grid.color = gridColor;
                }
            }
        }
        
        if (!chart.options.plugins) chart.options.plugins = {};
        if (!chart.options.plugins.legend) chart.options.plugins.legend = {};
        if (!chart.options.plugins.legend.labels) chart.options.plugins.legend.labels = {};
        chart.options.plugins.legend.labels.color = textColor;
    });

    if (chartInstances.opRes && chartInstances.opRes.data.datasets[1]) {
        chartInstances.opRes.data.datasets[1].borderColor = targetLineColor;
    }

    Object.values(chartInstances).forEach(chart => chart.update());
}

function populateBuildingsTable() {
    const tableBody = document.getElementById('buildings-table-body');
    if (!tableBody || !dashboardData.buildingsList) return;
    
    tableBody.innerHTML = '';
    
    dashboardData.buildingsList.forEach(b => {
        const row = document.createElement('tr');
        
        const catTranslated = i18next.t(`cat_${b.construction_type.toLowerCase()}`, { defaultValue: b.construction_type });
        const vacantBadgeClass = b.vacant_units === 0 ? 'badge-vacant zero' : 'badge-vacant';
        const vacantText = b.vacant_units === 0 ? i18next.t('tbl_val_none', { defaultValue: 'Aucun' }) : `${b.vacant_units} / ${b.total_units}`;
        
        row.innerHTML = `
            <td><strong>${b.name}</strong></td>
            <td>${b.address}</td>
            <td>${catTranslated}</td>
            <td><span class="${vacantBadgeClass}">${vacantText}</span></td>
            <td>${b.total_units}</td>
        `;
        tableBody.appendChild(row);
    });
}
