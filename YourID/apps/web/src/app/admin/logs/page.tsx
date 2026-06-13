'use client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Shield } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminLogsPage() {
  // Audit logs would be implemented here
  return (
    <div className="space-y-6">
      <h1 className="page-title">Logs & Audit</h1>
      <div className="card text-center py-16">
        <Shield size={40} className="mx-auto text-gray-200 mb-4"/>
        <p className="text-gray-600 font-medium">Logs d'audit</p>
        <p className="text-gray-400 text-sm mt-2">Cette section affichera les logs de sécurité et d'audit de la plateforme.</p>
        <p className="text-gray-400 text-xs mt-4">Table AuditLog disponible en base de données — implémentation frontend à venir.</p>
      </div>
    </div>
  );
}
