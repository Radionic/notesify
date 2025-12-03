import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type PathItem = { id: string | null; name: string };

interface FileBreadcrumbProps {
  path: PathItem[];
  onNavigate: (index: number) => void;
}

export const FileBreadcrumb = ({ path, onNavigate }: FileBreadcrumbProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-lg">
        {path.map((item, index) => (
          <BreadcrumbItem key={item.id ?? "root"}>
            {index < path.length - 1 ? (
              <>
                <BreadcrumbLink
                  className="cursor-pointer text-lg font-medium"
                  onClick={() => onNavigate(index)}
                >
                  {item.name}
                </BreadcrumbLink>
                <BreadcrumbSeparator className="[&>svg]:w-4 [&>svg]:h-4" />
              </>
            ) : (
              <BreadcrumbPage className="text-lg font-semibold">
                {item.name}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
