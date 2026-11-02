// Mock Data for the Property Management Dashboard

var dashboardData = {
    global: {
        kpi: {
            revenue: "3.2M €",
            occupancy: "85.5%",
            openRequests: "12",
            criticalIncidents: "3"
        },
        charts: {
            revenueExpense: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                revenue: [260, 265, 270, 268, 275, 272, 280, 278, 285, 290, 288, 295],
                expense: [85, 90, 80, 110, 85, 95, 100, 85, 90, 105, 80, 95] 
            },
            incidentDistribution: {
                labels: ['Plomberie', 'Électricité', 'CVC', 'Structure', 'Autre'],
                data: [40, 25, 15, 10, 10]
            }
        }
    },
    financial: {
        kpi: {
            rentRevenue: "3.2M €",
            collectionRate: "97.2%",
            operatingExpenses: "1.1M €",
            netMargin: "2.1M €",
            activeDeposits: "320k €"
        },
        charts: {
            revVsCost: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                revenue: [795, 815, 843, 873],
                costs: [255, 290, 280, 280]
            },
            costStructure: {
                labels: ['Maintenance', 'Services Publics', 'Taxes', 'Assurances', 'Gestion'],
                data: [35, 20, 25, 10, 10]
            }
        }
    },
    commercial: {
        kpi: {
            occupancyRate: "85.5%",
            avgLeaseDelay: "18 jrs",
            depositsCollected: "35k €",
            tenantTurnover: "45"
        },
        charts: {
            occupancyTrend: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                data: [78.3, 74.4, 77.2, 76.7, 76.1, 73.3, 67.8, 63.3, 61.1, 58.3, 53.3, 48.9]
            },
            leaseExpirations: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4', '2027+'],
                data: [15, 25, 40, 30, 290]
            },
            unitTypology: {
                labels: ['Studio', 'T2', 'T3', 'T4'],
                data: [53, 50, 38, 39]
            }
        }
    },
    operational: {
        kpi: {
            avgResolutionTime: "3.5 jrs",
            openRequests: "12",
            avgMaintenanceCost: "450 €",
            criticalIncidents: "3 (85k€)"
        },
        charts: {
            resolutionTimeTrend: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                actual: [4.2, 4.0, 3.8, 3.5, 3.6, 3.5],
                target: [3.0, 3.0, 3.0, 3.0, 3.0, 3.0]
            },
            requestsByCategory: {
                labels: ['Plomberie', 'Électricité', 'CVC', 'Structure', 'Autre'],
                data: [45, 30, 20, 15, 10]
            }
        }
    },
    buildingsList: [
        { name: "Immeuble 1", address: "Rue de la Paix, Levallois-Perret", construction_type: "Mixed", total_units: 9, vacant_units: 1 },
        { name: "Immeuble 2", address: "Rue de Versailles, Levallois-Perret", construction_type: "Concrete", total_units: 9, vacant_units: 4 },
        { name: "Immeuble 3", address: "Rue de la Paix, Paris", construction_type: "Mixed", total_units: 9, vacant_units: 8 },
        { name: "Immeuble 4", address: "Avenue de Versailles, Levallois-Perret", construction_type: "Stone", total_units: 9, vacant_units: 5 },
        { name: "Immeuble 5", address: "Impasse Montmartre, Paris", construction_type: "Concrete", total_units: 9, vacant_units: 7 }
    ]
};
