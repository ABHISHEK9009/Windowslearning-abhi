import { useParams } from 'react-router-dom';
import MentorLayout from '@/components/MentorLayout';
import { useRequirement } from '@/hooks/useApi';

const MentorRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: requirement, isLoading } = useRequirement(id!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MentorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{requirement.title}</h1>
        <p className="mt-2">{requirement.description}</p>
        {/* Add more details as needed */}
      </div>
    </MentorLayout>
  );
};

export default MentorRequestDetail;