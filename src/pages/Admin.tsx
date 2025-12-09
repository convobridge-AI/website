import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const nums = await apiClient.getNumbers();
      setNumbers(nums.numbers || nums);
    } catch (err) {
      toast({ title: 'Error loading numbers', variant: 'destructive' });
    }
    try {
      const res = await apiClient.getContacts();
      setContacts(res.contacts || res);
    } catch (err) {
      toast({ title: 'Error loading contacts', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleAddNumber = async () => {
    if (!newNumber.trim()) return;
    try {
      const res = await apiClient.createNumber({ number: newNumber.trim() });
      toast({ title: 'Number added' });
      setNewNumber('');
      loadAll();
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Failed to add number', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteNumber(id);
      toast({ title: 'Number deleted' });
      setNumbers((s) => s.filter(n => n._id !== id));
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-h2 mb-4">Admin Panel</h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Phone Numbers</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="+1 (555) 000-0000" />
          <Button onClick={handleAddNumber}>Add</Button>
        </div>

        <div className="space-y-2">
          {numbers.map((n) => (
            <div key={n._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{n.number}</div>
                <div className="text-xs text-muted-foreground">{n.label || n.provider || (n.available ? 'Available' : 'Unavailable')}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDelete(n._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Contact Submissions</h2>
        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c._id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{c.name} • {c.email}</div>
                  <div className="text-xs text-muted-foreground">{c.company}</div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm">{c.message}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
