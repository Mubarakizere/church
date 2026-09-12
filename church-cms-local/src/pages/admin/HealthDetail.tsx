import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiUrls } from '@/config/api';

const HealthDetail = () => {
  const { id } = useParams();
  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await fetch(`${apiUrls.healthCenters()}/${id}`);
        if (res.ok) {
          setFacility(await res.json());
        } else {
          // try posts endpoint
          const res2 = await fetch(`${apiUrls.healthPosts()}/${id}`);
          if (res2.ok) setFacility(await res2.json());
        }
      } catch (err) {
        console.error('Failed to fetch facility', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacility();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!facility) return <div className="p-6">Facility not found</div>;

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/admin/health">
          <Button variant="outline">Back to Health</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{facility.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{facility.description}</p>
          <p className="text-sm text-gray-500 mt-2">Location: {facility.location}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDetail;